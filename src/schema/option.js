import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type Option {
		id: ID!
		name: String!
		description: String
		order: Int!
		active: Boolean!
		price: Float!
		createdAt: DateTime!
		updatedAt: DateTime!
		maxSelectRestrainOther: Int
	}

	input OptionInput {
		id: ID
		action: String! #create | update | delete
		name: String
		description: String
		order: Int
		active: Boolean
		price: Float
		maxSelectRestrainOther: Int
	}
	
`;

export const resolvers =  {
	
}