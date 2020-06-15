import { gql, withFilter }  from 'apollo-server';
import { literal, fn, where, col } from 'sequelize';

import CreditsController from '../controller/credits';
import OrderController from '../controller/order';
import { ORDER_CREATED, ORDER_QTY_STATUS_UPDATED, ORDER_STATUS_UPDATED } from '../controller/order';
import { orderCompanyLoader, orderUserLoader, orderPaymentMethodLoader } from '../loaders';
import Company from '../model/company';
import Coupon from '../model/coupon';
import Order from '../model/order';
import OrderProduct  from '../model/orderProduct';
import User from '../model/user';
import sequelize  from '../services/connection';
import pubSub from '../services/pubsub'
import { sanitizeFilter, getSQLPagination } from '../utilities';
import { pointFromCoordinates, joinAddress } from '../utilities/address';
import { companyIsOpen, defaultBusinessHours } from '../utilities/company';

export const typeDefs =  gql`
	type Order {
		id: ID!
		user: User!
		paymentFee: Float!
		deliveryPrice: Float!
		deliveryTime: Int!
		price: Float!
		subtotal: Float!
		type: String!
		discount: Float!
		status: String!
		message: String!
		createdAt: DateTime!
		updatedAt: DateTime!
		paymentMethod: PaymentMethod
		
		company: Company!
		address: Address
	}

	input OrderInput {
		userId: ID
		type: String
		status: String
		paymentMethodId: ID
		useCredits: Boolean
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

	extend type Company {
		countOrders(filter:JSON): Int! @hasRole(permission: "orders_read")
		orders(filter:JSON, pagination: Pagination): [Order]! @hasRole(permission: "orders_read")
	}

	type Subscription {
		orderCreated(companyId: ID!): Order

		updateOrderStatus(companyId: ID!): Order!
		updateOrderStatusQty(companyId: ID!): JSON!
	}

	extend type Query {
		order (id: ID!): Order!

		countOrders(filter:JSON): Int! @hasRole(permission: "master")
		orders (filter: JSON, pagination: Pagination): [Order]! @hasRole(permission: "master")
	}

	extend type Mutation {
		checkOrderAddress(order: OrderInput!): Boolean! @isAuthenticated
		checkOrderProducts(order: OrderInput!): Boolean! @isAuthenticated

		createOrder(data: OrderInput!): Order! @isAuthenticated
		updateOrder(id: ID!, data: OrderInput!): Order! @hasRole(permission: "orders_edit")

		changeStatus(id: ID!, newStatus: String!): Order!

		cancelOrder(id: ID!): Order!
	}
`;

export const resolvers =  {
	Subscription: {
		orderCreated: {
			subscribe: withFilter (
				()=> pubSub.asyncIterator(ORDER_CREATED),
				(payload, variables) => {
					return payload.orderCreated.companyId == variables.companyId;
				}
			)
		},
		updateOrderStatusQty: {
			subscribe: withFilter (
				()=> pubSub.asyncIterator(ORDER_QTY_STATUS_UPDATED),
				(payload, variables) => {
					return payload.updateOrderStatusQty.companyId == variables.companyId;
				}
			)
		},
		updateOrderStatus: {
			subscribe: withFilter (
				()=> pubSub.asyncIterator([ORDER_STATUS_UPDATED]),
				(payload, variables) => {
					return payload.updateOrderStatus.companyId == variables.companyId;
				}
			)
		}
	},
	Order: {
		async user(parent) {
			if (parent.user) return parent.user;

			const userId = parent.userId;
			const user = await orderUserLoader.load(userId);

			return user
		},
		
		paymentMethod(parent) {
			if (parent.paymentMethod) return parent.paymentMethod;

			const paymentMethodId = parent.paymentMethodId;
			return orderPaymentMethodLoader.load(paymentMethodId);
		},

		async address(parent) {
			if (!(parent instanceof Order)) parent = await Order.findByPk(parent.id);

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
				reference: parent.get('referenceAddress'),
				location: parent.get('locationAddress'),
			}
		},
		company(parent) {
			const companyId = parent.companyId

			return orderCompanyLoader.load(companyId);
		},
		subtotal (parent) {
			return parent.price + parent.discount;
		}
	},
	Query: {
		order(_, { id }) {
			return Order.findByPk(id)
				.then((order)=>{
					if (!order) throw new Error('Pedido não encontrado');
					return order;
				})
		},
		countOrders(parent, { filter }) {
			const search = ['streetAddress', '$user.firstName$', '$user.lastName$', '$user.email$'];
			const where = sanitizeFilter(filter, { search, excludeFilters: ['active'], table: 'order' });

			return Order.count({ where, include: [User] });
		},
		orders(_, { filter, pagination }) {
			const search = ['streetAddress', '$user.firstName$', '$user.lastName$', '$user.email$'];
			const where = sanitizeFilter(filter, { search, excludeFilters: ['active'], table: 'order' });

			return Order.findAll({
				where,
				order: [['createdAt', 'DESC']],
				...getSQLPagination(pagination),

				include: [User]
			});
		}
	},
	Company: {
		countOrders(parent, { filter }) {
			const search = ['streetAddress', '$user.firstName$', '$user.lastName$', '$user.email$'];
			const _filter = sanitizeFilter(filter, { search, excludeFilters: ['active'], table: 'order' });

			return parent.countOrders({ where: _filter, include: [User] });
		},
		orders(parent, { filter, pagination }) {
			const search = ['streetAddress', '$user.firstName$', '$user.lastName$', '$user.email$'];
			const _filter = sanitizeFilter(filter, { search, excludeFilters: ['active'], table: 'order' });

			return parent.getOrders({
				where: _filter,
				order: [['createdAt', 'DESC']],
				...getSQLPagination(pagination),

				include: [User]
			});
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
				// check if company exits
				const company = await Company.findByPk(data.companyId);
				if (!company) throw new Error('Estabelecimento não encontrado');

				// check if company is open
				const businessHours = await company.getMetas({ where: { key: 'businessHours' } }).then(([meta]) => {if (meta) return JSON.parse(meta.get('value')); else return defaultBusinessHours()});
				const isOpen = companyIsOpen(businessHours);
				if (!(selectedCompany && selectedCompany.get('id') === company.get('id')) && !isOpen) throw new Error(`${company.get('displayName')} está fechado no momento`);

				//check if coupon is valid
				if (data.couponId) {
					const coupon = await Coupon.findByPk(data.couponId);
					await coupon.isValid(data);
				}
				
				// check if user credits
				if (data.useCredits) {
					const createdHistory = await CreditsController.checkUserCredits(createdOrder, company, { transaction });
					data.creditHistoryId = createdHistory.get('id');
				}
				
				// create order
				const createdOrder = await OrderController.create(data, company, { transaction });

				return createdOrder;
			});
		},
		updateOrder(_, { id, data }) {
			return sequelize.transaction(async (transaction) => {
				// check if order exists
				const order = await Order.findByPk(id);
				if (!order) throw new Error('Pedido não encontrado');

				// allow to change status only using funcion changeStatus
				if (data.status) delete data.status;

				// sanitize address
				if (data.address) {
					const address = joinAddress(data.address);
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
		},
		async changeStatus (_, { id, newStatus }, { user: loggedUser }) {
			const order = await Order.findByPk(id);
			if (!order) throw new Error('Pedido não encontrado');

			return OrderController.changeStatus(order, newStatus, null, { loggedUser });
		},
		// deprecated => use changeStatus
		async cancelOrder(_, { id }, { user }) {
			const order = await Order.findByPk(id);
			const orderUser = await order.getUser();
			
			if (orderUser.get('id') !== user.get('id') && !user.can('orders_edit')) throw new Error('Você não tem permissões para cancelar esse pedido');

			if (order.get('status') !== 'waiting') throw new Error('Você não pode cancelar esse pedido, o status dele já foi alterado');

			const updatedOrder = await order.update({ status: 'canceled' });

			// emit event for update subscriptions
			pubSub.publish(ORDER_STATUS_UPDATED, { updateOrderStatus: updatedOrder });

			return updatedOrder;
		}
	}
}