import { gql, withFilter, PubSub }  from 'apollo-server';

import OrderProduct  from '../model/orderProduct';
import sequelize  from '../services/connection';

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
		
		address: Address!

		countProducts: Int!
		products: [OrderProduct]!		
	}	

	input OrderInput {
		userId: ID
		type: String
		status: String
		paymentMethodId: ID

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
		createOrder(data: OrderInput!): Order!
		updateOrder(id: ID!, data: OrderInput!): Order!
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
			return parent.getProducts()
				.then(products=>products.length);
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
		}
	},
	Query: {
		order: (_, { id }, { company }) => {
			return company.getOrders({ where: { id } })
				.then(([order])=>{
					if (!order) throw new Error('Pedido não encontrado');
					return order;
				})
		}
	},
	Mutation: {
		createOrder(_, { data }, { company }) {
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

				// create order
				const order = await company.createOrder(data, { transaction });
				
				// create order products
				await OrderProduct.updateAll(data.products, order, transaction);

				// emit event for subscriptions
				pubsub.publish(ORDER_CREATED, { orderCreated: order });

				return order;
			});
		},
		updateOrder: (_, { id, data }, { company }) => {
			return sequelize.transaction(async (transaction) => {
				// check if order exists
				const [order] = await company.getOrders({ where: { id } });
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
		}
	}
}