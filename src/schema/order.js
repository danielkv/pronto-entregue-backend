import { gql, withFilter, PubSub }  from 'apollo-server';
import { literal, fn, where, col } from 'sequelize';

import { queueCustomerStatusChangeNotification, queueNewOrderNotification } from '../controller/notifications';
import { ORDER_CREATED, ORDER_QTY_STATUS_UPDATED, getOrderStatusQty, ORDER_STATUS_UPDATED } from '../controller/order';
import Company from '../model/company';
import Order from '../model/order';
import OrderProduct  from '../model/orderProduct';
import sequelize  from '../services/connection';
import { pointFromCoordinates } from '../utilities/address';
import { companyIsOpen, defaultBusinessHours } from '../utilities/company';

const pubsub = new PubSub();

export const typeDefs =  gql`
	type Order {
		id: ID!
		user: User!
		paymentFee: Float!
		deliveryPrice: Float!
		deliveryTime: Int!
		price: Float!
		type: String!
		discount: Float!
		status: String!
		message: String!
		createdAt: DateTime!
		updatedAt: DateTime!
		paymentMethod: PaymentMethod!
		
		company: Company!
		address: Address

		countProducts: Int!
		products: [OrderProduct]!		
	}	

	input OrderInput {
		userId: ID
		type: String
		status: String
		paymentMethodId: ID
		companyId: ID

		paymentFee: Float
		deliveryPrice: Float
		deliveryTime: Int
		discount: Float
		price: Float
		message: String
		
		address: AddressInput

		products: [OrderProductInput]
	}

	type Subscription {
		orderCreated(companyId: ID!): Order

		updateOrderStatus(companyId: ID!): Order!
		updateOrderStatusQty(companyId: ID!): JSON!
	}

	extend type Query {
		order (id: ID!): Order!
	}

	extend type Mutation {
		checkOrderAddress(order: OrderInput!): Boolean! @isAuthenticated
		checkOrderProducts(order: OrderInput!): Boolean! @isAuthenticated

		createOrder(data: OrderInput!): Order! @isAuthenticated
		updateOrder(id: ID!, data: OrderInput!): Order! @hasRole(permission: "orders_edit")

		cancelOrder(id: ID!): Order!
	}
`;

export const resolvers =  {
	Subscription: {
		orderCreated: {
			subscribe: withFilter (
				()=> pubsub.asyncIterator([ORDER_CREATED]),
				(payload, variables) => {
					return payload.orderCreated.get('companyId') == variables.companyId;
				}
			)
		},
		updateOrderStatusQty: {
			subscribe: withFilter (
				()=> pubsub.asyncIterator([ORDER_QTY_STATUS_UPDATED]),
				(payload, variables) => {
					return payload.updateOrderStatusQty.companyId == variables.companyId;
				}
			)
		},
		updateOrderStatus: {
			subscribe: withFilter (
				()=> pubsub.asyncIterator([ORDER_STATUS_UPDATED]),
				(payload, variables) => {
					return payload.updateOrderStatus.get('companyId') == variables.companyId;
				}
			)
		}
	},
	Order: {
		user: (parent) => {
			if (parent.user) return parent.user;

			return parent.getUser();
		},
		products: (parent) => {
			return parent.getProducts();
		},
		countProducts: (parent) => {
			return parent.countProducts();
		},
		paymentMethod: (parent) => {
			if (parent.paymentMethod) return parent.paymentMethod;

			return parent.getPaymentMethod();
		},
		address(parent) {
			if (parent.get('type') === 'takeout') return null;

			return {
				id: `_order_${parent.get('id')}`,
				name: parent.get('nameAddress'),
				street: parent.get('streetAddress'),
				number: parent.get('numberAddress'),
				complement: parent.get('complementAddress'),
				zipcode: parent.get('zipcodeAddress'),
				district: parent.get('districtAddress'),
				city: parent.get('cityAddress'),
				state: parent.get('stateAddress'),
				location: parent.get('locationAddress'),
			}
		},
		company(parent) {
			return parent.getCompany();
		}
	},
	Query: {
		order: (_, { id }) => {
			return Order.findByPk(id)
				.then((order)=>{
					if (!order) throw new Error('Pedido não encontrado');
					return order;
				})
		}
	},
	Mutation: {
		async checkOrderAddress(_, { order: { address, companyId } }) {

			// load
			const company = await Company.findByPk(companyId);

			// transform points
			const userPoint = pointFromCoordinates(address.location.coordinates);

			// user addres && companies
			const [deliveryArea] = await company.getDeliveryAreas({
				order: [['radius', 'ASC']],
				limit: 1,
				where: where(fn('ST_Distance_Sphere', userPoint, col('center')), '<=', literal('radius')),
			})

			// case delivery area's not found
			if (!deliveryArea) throw new Error(`${company.get('displayName')} não faz entrega em sua localização`);

			return true;
		},
		async checkOrderProducts(_, { order: { products, companyId }  }) {
			// load
			const company = await Company.findByPk(companyId);

			// check if order has products
			if (!products.length) throw new Error('O pedido não tem nenhum produto');

			// products
			const productsFound = await company.getProducts({
				where: {
					id: products.map(prod => prod.productRelatedId),
					active: true,
				}
			});

			// Check if all prodtucts in order are active
			if (productsFound.length !== products.length) throw new Error('Alguns produtos não foram encontrados no cardápio do estabelecimento')

			// price ?
			// coupons ?

			return true;
		},
		createOrder(_, { data }, { company: selectedCompany }) {
			return sequelize.transaction(async (transaction) => {
				// sanitize address
				if (data.address) {
					const address = {
						nameAddress: data.address.name,
						streetAddress: data.address.street,
						numberAddress: data.address.number,
						complementAddress: data.address.complement,
						zipcodeAddress: data.address.zipcode,
						districtAddress: data.address.district,
						cityAddress: data.address.city,
						stateAddress: data.address.state,
						locationAddress: data.address.location,
					}
					delete data.address;
					data = { ...data, ...address };
				}
				
				// check if company exits
				const company = await Company.findByPk(data.companyId);
				if (!company) throw new Error('Estabelecimento não encontrado');

				// check if company is open
				const businessHours = await company.getMetas({ where: { key: 'businessHours' } }).then(([meta]) => {if (meta) return JSON.parse(meta.get('value')); else return defaultBusinessHours()});
				const isOpen = companyIsOpen(businessHours);
				if (!(selectedCompany && selectedCompany.get('id') === company.get('id')) && !isOpen) throw new Error(`${company.get('displayName')} está fechado no momento`);

				// create order
				const order = await company.createOrder(data, { transaction });
				
				// create order products
				await OrderProduct.updateAll(data.products, order, transaction);

				// emit event for subscriptions
				pubsub.publish(ORDER_CREATED, { orderCreated: order });

				// queue company user notifications
				queueNewOrderNotification(data.companyId, order.id);
				
				return order;
			});
		},
		async updateOrder(_, { id, data }) {
			// GET old order status
			let oldOrderStatus = null;
			let newOrderStatus =  data.status;

			const updatedOrder = await sequelize.transaction(async (transaction) => {
				// check if order exists
				const order = await Order.findByPk(id);
				if (!order) throw new Error('Pedido não encontrado');

				oldOrderStatus = order.get('status');

				// sanitize address
				if (data.address) {
					const address = {
						nameAddress: data.address.name,
						streetAddress: data.address.street,
						numberAddress: data.address.number,
						complementAddress: data.address.complement,
						zipcodeAddress: data.address.zipcode,
						districtAddress: data.address.district,
						cityAddress: data.address.city,
						stateAddress: data.address.state,
						locationAddress: data.address.location,
					}
					delete data.address;
					data = { ...data, ...address };
				}

				// cannot update payment method
				if (data.paymentMethod) delete data.paymentMethod;

				// update order
				const updatedOrder = await order.update(data, { transaction });

				// update, create, remove order products
				if (data.products) await OrderProduct.updateAll(data.products, updatedOrder, transaction);

				return updatedOrder;
			});

			// emit event for update subscriptions
			pubsub.publish(ORDER_STATUS_UPDATED, { updateOrderStatus: updatedOrder });

			// check with new status
			if (oldOrderStatus !== newOrderStatus) {
				const orderId = updatedOrder.get('id');
				const userId = updatedOrder.get('userId');
				const ordersStatusQty = await getOrderStatusQty(updatedOrder.get('companyId'));

				// emit event for updated status subscriptions
				pubsub.publish(ORDER_QTY_STATUS_UPDATED, { updateOrderStatusQty: ordersStatusQty });

				// queue customer notification
				queueCustomerStatusChangeNotification(userId, orderId, newOrderStatus);
			}

			// return result
			return updatedOrder
		},
		async cancelOrder(_, { id }, { user }) {
			const order = await Order.findByPk(id);
			const orderUser = await order.getUser();
			
			if (orderUser.get('id') !== user.get('id') && !user.can('orders_edit')) throw new Error('Você não tem permissões para cancelar esse pedido');

			const updatedOrder = await order.update({ status: 'canceled' });

			// emit event for update subscriptions
			pubsub.publish(ORDER_STATUS_UPDATED, { updateOrderStatus: updatedOrder });

			return updatedOrder;
		}
	}
}