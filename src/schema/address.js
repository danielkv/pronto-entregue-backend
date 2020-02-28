
import { gql }  from 'apollo-server';

import GMaps from '../services/googleMapsClient';
import { parseAddresses } from '../utilities/address';


export const typeDefs = gql`

	type Address {
		id: ID
		name: String
		street: String
		number: Int
		complement: String
		zipcode: Int
		district: String
		city: String
		state: String
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
		searchLocation(location: GeoPoint!): Address! @isAuthenticated
	}

`;

export const resolvers =  {
	Mutation: {
		async searchAddress(_, { search }) {
			const { data: { results } } = await GMaps.geocode({
				params: {
					key: process.env.GMAPS_KEY,
					address: search,
					region: 'BR',
				}
			})

			const addresses = parseAddresses(results);

			return addresses;
		},
		async searchLocation(_, { location }) {
			const { data: { results } } = await GMaps.reverseGeocode({
				params: {
					key: process.env.GMAPS_KEY,
					latlng: {
						lat: location.coordinates[0],
						lng: location.coordinates[1],
					}
				}
			})
			
			const addresses = parseAddresses(results);

			return addresses[0];
		}
	}
}