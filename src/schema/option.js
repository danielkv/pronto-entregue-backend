import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type Option {
		id: ID!
		name: String!
		order: Int!
		active: Boolean!
		price: Float!
		createdAt: DateTime!
		updatedAt: DateTime!
		maxSelectRestrainOther: Int
	}
`;

export const resolvers =  {
	
}