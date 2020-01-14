import { gql }  from 'apollo-server';

import Role  from '../model/role';

export const typeDefs = gql`
	type Role {
		id: ID!
		name: String!
		displayName: String!
		permissions: [String]!
		createdAt: DateTime!
		updatedAt: DateTime!
	}
`;

export const resolvers = {
	Query: {
		roles: async () => {
			return Role.findAll();
		}
	}
}