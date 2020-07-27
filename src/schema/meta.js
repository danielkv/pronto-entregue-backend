import { gql }  from 'apollo-server';

export const typeDefs = gql`

	type Meta {
		id: ID!
		key: String!
		value: String!
		createdAt: DateTime!
	}

	input MetaInput {
		id: ID
		action: String #create | update | delete
		key: String
		value: String
	}
`;

export const resolvers = {
	
}