const {gql} = require('apollo-server');
const sequelize = require('../services/connection');
const Orders = require('../model/orders');
const OrderProducts = require('../model/orders_products');
const OrderOptionsGroups = require('../model/orders_options_groups');
const OrderOptions = require('../model/orders_options');

module.exports.typeDefs = gql`
	type Order {
		id:ID!
		user:User!
		payment_fee:Float!
		delivery_price:Float!
		price:Float!
		type:String!
		discount:Float!
		status:String!
		message:String!
		updatedAt:String!
		products:[OrderProduct]!
		payment_method:PaymentMethod!
		
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
		user_id:ID!
		type:String!
		status:String!
		payment_method_id:ID

		payment_fee:Float!
		delivery_price:Float!
		discount:Float
		price:Float!
		message:String!
		
		street:String
		number:Int
		complement:String
		city:String
		state:String
		district:String
		zipcode:String

		products:[OrderProductInput!]
	}

	input OrderProductInput {
		id:ID
		action:String!
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

	extend type Query {
		order (id:ID!): Order!
	}

	extend type Mutation {
		createOrder(data:OrderInput!):Order!
		updateOrder(id:ID!, data:OrderInput!):Order!
	}
`;

module.exports.resolvers = {
	Order: {
		user: (parent) => {
			return parent.getUser();
		},
		products: (parent, args, ctx) => {
			return parent.getProducts();
		},
		products_qty: (parent, args, ctx) => {
			return parent.getProducts()
			.then(products=>products.length);
		},
		payment_method: (parent, args, ctx) => {
			return parent.getPaymentMethod();
		},
		createdDate : (parent, args, ctx) => {
			const date = new Date(parent.get('createdAt'));
			let day = date.getDate();
			let month = date.getMonth()+1;

			if (day < 10) day = `0${day}`;
			if (month < 10) month = `0${month}`;

			return `${day}/${month}`;
		},
		createdTime : (parent, args, ctx) => {
			const date = new Date(parent.get('createdAt'));
			let hours = date.getHours();
			let minutes = date.getMinutes();

			if (hours < 10) hours = `0${hours}`;
			if (minutes < 10) minutes = `0${minutes}`;

			return `${hours}:${minutes}`;
		},
	},
	Query: {
		order: (parent, {id}, ctx) => {
			return ctx.branch.getOrders({where:{id}})
			.then(([order])=>{
				if (!order) throw new Error('Pedido não encontrado');
				return order;
			})
		}
	},
	Mutation : {
		createOrder: (parent, {data}, ctx) => {
			return sequelize.transaction(transaction => {
				return ctx.branch.createOrder(data, {transaction})
				.then(async (order)=> {
					await OrderProducts.updateAll(data.products, order, transaction);

					return order;
				})
			});
		},
		updateOrder: (parent, {id, data}, ctx) => {
			return sequelize.transaction(transaction => {
				//return OrderOptionsGroups.create({name:'teste'}, {transaction});

				return ctx.branch.getOrders({where:{id}})
				.then(async ([order])=> {
					if (!order) throw new Error('Pedido não encontrado');
					const updated_order = await order.update(data, {transaction});

					await OrderProducts.updateAll(data.products, updated_order, transaction);

					return updated_order;
				})
			});
		}
	}
}