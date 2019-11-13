const {gql} = require('apollo-server');

module.exports.typeDefs = gql`
	type OrderProduct {
		id: ID!
		name: String!
		quantity: Int!
		price: Float!
		message: String!
		product_related: Product!
		options_groups: [OrderOptionsGroup]!
	}
`;

module.exports.resolvers = {
	OrderProduct: {
		options_groups : (parent) => {
			return parent.getOptionsGroups();
		},
		product_related : (parent, {id}, ctx) => {
			return parent.getProductRelated();
		},
	}
}