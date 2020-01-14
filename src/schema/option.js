import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type Option {
		id: ID!
		name: String!
		order: Int!
		active: Boolean!
		price: Float!
		createdAt: String!
		updatedAt: String!
		maxSelectRestrainOther: Int
	}
`;

export const resolvers =  {
	
}