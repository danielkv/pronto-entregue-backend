const {gql} = require('apollo-server');

module.exports.typeDefs = gql`
	type Option {
		id:ID!
		name:String!
		order:Int!
		active:Boolean!
		price:Float!
		createdAt:String!
		updatedAt:String!
		max_select_restrain_other:Int
		item:Item
	}
`;

module.exports.resolvers = {
	Option: {
		item: (parent, args, ctx) => {
			return parent.getItem();
		},
	}
}