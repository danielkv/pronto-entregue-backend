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
		location: GeoPoint!
	}

	input AddressInput {
		id: ID
		name: String
		street: String!
		number: Int!
		complement: String
		zipcode: Int!
		district: String!
		city: String!
		state: String!
		location: GeoPoint
	}

`;

export const resolvers =  {
	
}