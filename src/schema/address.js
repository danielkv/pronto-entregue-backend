import { gql }  from 'apollo-server';

import GMaps from '../services/googleMapsClient';
import { parseAddresses } from '../utilities/address';

export const typeDefs = gql`

	type Address {
		id: ID
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

	extend type Mutation {
		searchAddress(search: String!): [Address]! @isAuthenticated
	}

`;

export const resolvers =  {
	Mutation: {
		async searchAddress(_, { search }) {
			const { json: { results } } = await GMaps.geocode({
				address: search,
				region: 'BR',
				language: 'pt-BR'
			}).asPromise();

			const addresses = parseAddresses(results);

			return addresses;
		}
	}
}