import { gql }  from 'apollo-server';

export const typeDefs = gql`

	type Address {
		id: ID!
		name: String
		street: String!
		number: Int!
		complement: String
		zipcode: Int!
		district: String!
		city: String!
		state: String!
	}

	input AddressInput {
		name: String!
		street: String!
		number: Int!
		complement: String
		zipcode: Int!
		district: String!
		city: String!
		state: String!
	}

`;

export const resolvers =  {
	
}