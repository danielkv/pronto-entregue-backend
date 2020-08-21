
import { gql }  from 'apollo-server';
import { Sequelize } from 'sequelize';

import DB from '../model';
import GMaps from '../services/googleMapsClient';
import { parseAddresses, pointFromCoordinates } from '../utilities/address';

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
		reference: String
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
		reference: String
		location: GeoPoint
	}

	extend type Mutation {
		searchAddress(search: String!): [Address]!
		searchLocation(location: GeoPoint!): Address!

		createAddress(data: AddressInput!, userId: ID): Address!
	}

	extend type Query {
		address(id: ID!): Address!

		getLastOrderAddress(userId: ID!): Address
	}

`;

export const resolvers = {
	Query: {
		address(_, { id }) {
			return DB.address.findByPk(id);
		},
		async getLastOrderAddress(_, { userId }) {
			// get last
			const lastOrder = await DB.order.findOne({
				where: { userId },
				order: [['createdAt', 'DESC']]
			});

			// get order location
			const orderLocation = lastOrder.get('locationAddress');

			// get closet address from user

			const point = pointFromCoordinates(orderLocation.coordinates);
			const address = await DB.address.findOne({
				include: [{
					model: DB.user,
					where: { id: userId }
				}],
				attributes: { include: [[Sequelize.fn('ST_Distance_Sphere', point, Sequelize.col('address.location')), 'distance']] },
				order: [[Sequelize.col('distance'), 'ASC']]
			})

			return address;
		}
	},
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
		// deprecated
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
			
			const [address] = parseAddresses(results);
			
			if (address.street === 'Unnamed Road') delete address.street;

			return address;
		}
	}
}