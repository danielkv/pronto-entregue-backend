import { gql }  from 'apollo-server';

import Roles  from '../model/roles';

export const typeDefs = gql`
	type Role {
		id:ID!
		name:String!
		display_name:String!
		permissions:[String]!
		createdAt:String!
		updatedAt:String!
	}
`;

export const resolvers = {
	Query: {
		roles : async () => {
			return Roles.findAll();
		}
	}
}