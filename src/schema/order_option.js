const {gql} = require('apollo-server');

module.exports.typeDefs = gql`
	type OrderOption {
		id:ID!
		name:String!
		price:Float!
		option_related:Option!
		item_related:Item!
	}
`;

module.exports.resolvers = {
	OrderOption: {
		option_related : (parent) => {
			return parent.getOptionRelated();
		},
		item_related: (parent) => {
			return parent.getItemRelated();
		},
	}
}