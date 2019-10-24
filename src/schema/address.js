const {gql} = require('apollo-server');

module.exports.typeDefs = gql`

	type Address {
		id:ID!
		name:String
		street:String!
		number:String!
		zipcode:String!
		district:String!
		city:String!
		state:String!
	}

	

`;

module.exports.resolvers = {
	
}