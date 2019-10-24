const {gql} = require('apollo-server');
const Items = require('../model/items');

module.exports.typeDefs = gql`
	type Item {
		id:ID!
		name:String!
		description:String!
		active:Boolean!
		createdAt:String! @dateTime
		updatedAt:String! @dateTime
		order_options:[OrderOption]!
	}

	input ItemInput {
		name:String
		description:String
		active:Boolean
	}

	extend type Query {
		item(id:ID!): Item!
	}

	extend type Mutation {
		updateItem(id:ID!, data:ItemInput): Item!
		createItem(data:ItemInput!): Item!
	}
`;

module.exports.resolvers = {
	Query : {
		item : (parent, {id}, ctx) => {
			return Items.findByPk(id);
		},
	},
	Mutation: {
		createItem : (parent, {data}, ctx) => {
			return ctx.company.createItem(data);
		},
		updateItem : (parent, {id, data}, ctx) => {
			return Items.findByPk(id)
			.then(item =>{
				return item.update(data, {fields:['name', 'description', 'active']});
			});
		},
	},
	Item: {
		order_options: (parent, args, ctx) => {

		},
	}
}