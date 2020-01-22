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
		updatedAt: String!
		paymentMethod: PaymentMethod!
		
		street: String
		number: Int
		complement: String
		city: String
		state: String
		district: String
		zipcode: String

		countProducts: Int!
		products: [OrderProduct]!

		createdDate: String!
		createdTime: String!
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
		
		street: String
		number: String
		complement: String
		city: String
		state: String
		district: String
		zipcode: Int

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
		createdDate: (parent) => {
			const date = new Date(parent.get('createdAt'));
			let day = date.getDate();
			let month = date.getMonth()+1;

			if (day < 10) day = `0${day}`;
			if (month < 10) month = `0${month}`;

			return `${day}/${month}`;
		},
		createdTime: (parent) => {
			const date = new Date(parent.get('createdAt'));
			let hours = date.getHours();
			let minutes = date.getMinutes();

			if (hours < 10) hours = `0${hours}`;
			if (minutes < 10) minutes = `0${minutes}`;

			return `${hours}:${minutes}`;
		},
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

				// update order
				const updatedOrder = await order.update(data, { transaction });

				// update, create, remove order products
				if (data.products) await OrderProduct.updateAll(data.products, updatedOrder, transaction);

				return updatedOrder;
			});
		}
	}
}