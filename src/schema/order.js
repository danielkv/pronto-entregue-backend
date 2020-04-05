import { gql, withFilter, PubSub }  from 'apollo-server';
import { literal, fn, where } from 'sequelize';

import Company from '../model/company';
import Order from '../model/order';
import OrderProduct  from '../model/orderProduct';
import sequelize  from '../services/connection';
import { pointFromCoordinates } from '../utilities/address';
import { companyIsOpen } from '../utilities/company';

const pubsub = new PubSub();

export const typeDefs =  gql`
	type Order {
		id: ID!
		user: User!
		paymentFee: Float!
		deliveryPrice: Float!
		price: Float!
		type: String!
		discount: Float!
		status: String!
		message: String!
		createdAt: DateTime!
		updatedAt: DateTime!
		paymentMethod: PaymentMethod!
		
		company: Company!
		address: Address!

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
		discount: Float
		price: Float
		message: String
		
		address: AddressInput

		products: [OrderProductInput]
	}

	input OrderProductInput {
		id: ID
		action: String!
		quantity: Int!
		name: String!
		price: Float!
		message: String!
		productRelatedId: ID
		optionsGroups: [OrderOptionsGroupInput!]
	}

	input OrderOptionsGroupInput {
		id: ID
		name: String!
		optionsGroupRelatedId: ID!
		
		options: [OrderOptionInput!]
	}

	input OrderOptionInput {
		id: ID
		name: String!
		price: Float!
		optionRelatedId: ID!
	}

	type Subscription {
		orderCreated(companyId: ID!): Order
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

const ORDER_CREATED = 'ORDER_CREATED';

export const resolvers =  {
	Subscription: {
		orderCreated: {
			subscribe: withFilter (
				()=> pubsub.asyncIterator([ORDER_CREATED]),
				(payload, variables) => {
					return payload.orderCreated.get('companyId') == variables.companyId;
				}
			)
		}
	},
	Order: {
		user: (parent) => {
			return parent.getUser();
		},
		products: (parent) => {
			return parent.getProducts();
		},
		countProducts: (parent) => {
			return parent.countProducts();
		},
		paymentMethod: (parent) => {
			return parent.getPaymentMethod();
		},
		address(parent) {
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
			const companyAddress = await company.getAddress();

			// transform points
			const companyPoint = pointFromCoordinates(companyAddress.location.coordinates);
			const userPoint = pointFromCoordinates(address.location.coordinates);

			// user addres && companies
			const [deliveryArea] = await company.getDeliveryAreas({
				order: [['distance', 'ASC']],
				limit: 1,
				where: where(fn('ST_Distance_Sphere', userPoint, companyPoint), '<', literal('distance * 1000')),
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
				
				// check if company exits
				const company = await Company.findByPk(data.companyId);
				if (!company) throw new Error('Estabelecimento não encontrado');

				// check if company is open
				const isOpen = await companyIsOpen(company);
				if (!(selectedCompany && selectedCompany.get('id') === company.get('id')) && !isOpen) throw new Error(`${company.get('displayName')} está fechado no momento`);

				// create order
				const order = await company.createOrder(data, { transaction });
				
				// create order products
				await OrderProduct.updateAll(data.products, order, transaction);

				// emit event for subscriptions
				pubsub.publish(ORDER_CREATED, { orderCreated: order });

				return order;
			});
		},
		updateOrder(_, { id, data }) {
			return sequelize.transaction(async (transaction) => {
				// check if order exists
				const order = await Order.findByPk(id);
				if (!order) throw new Error('Pedido não encontrado');

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

				// update order
				const updatedOrder = await order.update(data, { transaction });

				// update, create, remove order products
				if (data.products) await OrderProduct.updateAll(data.products, updatedOrder, transaction);

				return updatedOrder;
			});
		},
		async cancelOrder(_, { id }, { user }) {
			const order = await Order.findByPk(id);
			const orderUser = await order.getUser();
			
			if (orderUser.get('id') !== user.get('id') && !user.can('orders_edit')) throw new Error('Você não tem permissões para cancelar esse pedido');

			return await order.update({ status: 'canceled' });
		}
	}
}