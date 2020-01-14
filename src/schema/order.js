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
		products: [OrderProduct]!
		paymentMethod: PaymentMethod!
		
		street: String
		number: Int
		complement: String
		city: String
		state: String
		district: String
		zipcode: String

		productsQty: Int!
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
		productId: ID
		optionGroups: [OrderOptionGroupInput!]
	}

	input OrderOptionGroupInput {
		id: ID
		name: String!
		optionGroupId: ID!
		
		options: [OrderOptionInput!]
	}

	input OrderOptionInput {
		id: ID
		name: String!
		price: Float!
		optionId: ID!
	}

	type Subscription {
		orderCreated(branchId: ID!): Order
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
					return payload.orderCreated.get('branchId') == variables.branchId;
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
		productsQty: (parent) => {
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

			return `${hours}: {minutes}`;
		},
	},
	Query: {
		order: (_, { id }, ctx) => {
			return ctx.branch.getOrders({ where: { id } })
				.then(([order])=>{
					if (!order) throw new Error('Pedido não encontrado');
					return order;
				})
		}
	},
	Mutation: {
		createOrder: (_, { data }, ctx) => {
			return sequelize.transaction(transaction => {
				return ctx.branch.createOrder(data, { transaction })
					.then(async (order)=> {
						await OrderProduct.updateAll(data.products, order, transaction);

						pubsub.publish(ORDER_CREATED, { orderCreated: order });

						return order;
					})
			});
		},
		updateOrder: (_, { id, data }, ctx) => {
			return sequelize.transaction(transaction => {
				//return OrderOptionsGroups.create({name: teste'}, {transaction});

				return ctx.branch.getOrders({ where: { id } })
					.then(async ([order])=> {
						if (!order) throw new Error('Pedido não encontrado');
						const updatedOrder = await order.update(data, { transaction });

						if (data.products) await OrderProduct.updateAll(data.products, updatedOrder, transaction);

						return updatedOrder;
					})
			});
		}
	}
}