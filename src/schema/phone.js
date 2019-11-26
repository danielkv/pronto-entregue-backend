const {gql} = require('apollo-server');

module.exports.typeDefs = gql`

	type Phone {
		id: ID!
		number: String!
	}	

`;

module.exports.resolvers = {
	
}