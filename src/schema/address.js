const {gql} = require('apollo-server');

module.exports.typeDefs = gql`

	type Address {
		id: ID!
		name: String
		street: String!
		number: String!
		complement: String
		zipcode: Int!
		district: String!
		city: String!
		state: String!
	}

	input UserAddressInput {
		name: String!
		street: String!
		number: String!
		complement: String
		zipcode: Int!
		district: String!
		city: String!
		state: String!
	}

	

`;

module.exports.resolvers = {
	
}