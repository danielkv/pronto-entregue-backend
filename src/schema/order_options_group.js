const {gql} = require('apollo-server');

module.exports.typeDefs = gql`
	type OrderOptionsGroup {
		id:ID!
		name:String!
		options_group_related:OptionsGroup!
		options:[OrderOption]!
	}
`;

module.exports.resolvers = {
	OrderOptionsGroup: {
		options : (parent) => {
			return parent.getOptions();
		},
		options_group_related: (parent) => {
			return parent.getOptionsGroupRelated();
		}
	}
}