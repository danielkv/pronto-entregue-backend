import { gql, withFilter, PubSub }  from 'apollo-server';

import OrderProducts  from '../model/orders_products';
import sequelize  from '../services/connection';

const pubsub = new PubSub();

export const typeDefs =  gql`
	type Order {
		id: ID!
		user: User!
		payment_fee: Float!
		delivery_price: Float!
		price: Float!
		type: String!
		discount: Float!
		status: String!
		message: String!
		updatedAt: String!
		products: [OrderProduct]!
		payment_method: PaymentMethod!
		
		street:String
		number:Int
		complement:String
		city:String
		state:String
		district:String
		zipcode:String

		products_qty:Int!
		createdDate:String!
		createdTime:String!
	}	

	input OrderInput {
		user_id: ID
		type: String
		status: String
		payment_method_id: ID

		payment_fee: Float
		delivery_price: Float
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
		id:ID
		action:String!
		quantity: Int!
		name:String!
		price:Float!
		message:String!
		product_id:ID
		options_groups:[OrderOptionsGroupInput!]
	}

	input OrderOptionsGroupInput {
		id:ID
		name:String!
		options_group_id:ID!
		
		options:[OrderOptionInput!]
	}

	input OrderOptionInput {
		id:ID
		name:String!
		price:Float!
		item_id:ID
		option_id:ID!
	}

	type Subscription {
		orderCreated(branch_id: ID!): Order
	}

	extend type Query {
		order (id:ID!): Order!
	}

	extend type Mutation {
		createOrder(data:OrderInput!): Order!
		updateOrder(id:ID!, data:OrderInput!): Order!
	}
`;

const ORDER_CREATED = 'ORDER_CREATED';

export const resolvers =  {
	Subscription: {
		orderCreated: {
			subscribe: withFilter (
				()=> pubsub.asyncIterator([ORDER_CREATED]),
				(payload, variables) => {
					return payload.orderCreated.get('branch_id') == variables.branch_id;
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
		products_qty: (parent) => {
			return parent.getProducts()
				.then(products=>products.length);
		},
		payment_method: (parent) => {
			return parent.getPaymentMethod();
		},
		createdDate : (parent) => {
			const date = new Date(parent.get('createdAt'));
			let day = date.getDate();
			let month = date.getMonth()+1;

			if (day < 10) day = `0${day}`;
			if (month < 10) month = `0${month}`;

			return `${day}/${month}`;
		},
		createdTime : (parent) => {
			const date = new Date(parent.get('createdAt'));
			let hours = date.getHours();
			let minutes = date.getMinutes();

			if (hours < 10) hours = `0${hours}`;
			if (minutes < 10) minutes = `0${minutes}`;

			return `${hours}:${minutes}`;
		},
	},
	Query: {
		order: (_, { id }, ctx) => {
			return ctx.branch.getOrders({ where:{ id } })
				.then(([order])=>{
					if (!order) throw new Error('Pedido não encontrado');
					return order;
				})
		}
	},
	Mutation : {
		createOrder: (_, { data }, ctx) => {
			return sequelize.transaction(transaction => {
				return ctx.branch.createOrder(data, { transaction })
					.then(async (order)=> {
						await OrderProducts.updateAll(data.products, order, transaction);

						pubsub.publish(ORDER_CREATED, { orderCreated: order });

						return order;
					})
			});
		},
		updateOrder: (_, { id, data }, ctx) => {
			return sequelize.transaction(transaction => {
				//return OrderOptionsGroups.create({name:'teste'}, {transaction});

				return ctx.branch.getOrders({ where:{ id } })
					.then(async ([order])=> {
						if (!order) throw new Error('Pedido não encontrado');
						const updated_order = await order.update(data, { transaction });

						if (data.products) await OrderProducts.updateAll(data.products, updated_order, transaction);

						return updated_order;
					})
			});
		}
	}
}