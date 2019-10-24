const {gql} = require('apollo-server');
const Roles = require('../model/roles');

module.exports.typeDefs = gql`
	type Role {
		id:ID!
		name:String!
		display_name:String!
		permissions:[String]!
		createdAt:String!
		updatedAt:String!
	}
`;

module.exports.resolvers = {
	Query: {
		roles : async (parent, args, ctx) => {
			return Roles.findAll();
		}
	}
}