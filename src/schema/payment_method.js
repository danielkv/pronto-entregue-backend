const {gql} = require('apollo-server');
const PaymentMethods = require('../model/payment_methods');

module.exports.typeDefs = gql`
	type PaymentMethod {
		id:ID!
		name:String!
		display_name:String!
		createdAt:String!
		updatedAt:String!
	}

	extend type Query {
		paymentMethods:[PaymentMethod]! @hasRole(permission:"payment_methods_read", scope:"adm")
	}
`;

module.exports.resolvers = {
	Query: {
		paymentMethods: (parent) => {
			return PaymentMethods.findAll();
		}
	}
}