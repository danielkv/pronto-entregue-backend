import { gql, ApolloError }  from 'apollo-server';
import { fn, where, literal, col }  from 'sequelize';

import Company from '../model/company';
import conn from '../services/connection';
import { pointFromCoordinates } from '../utilities/address';

export const typeDefs =  gql`
	type DeliveryArea {
		id: ID!
		name: String
		center: GeoPoint
		radius: Float
		distance: Int
		price: Float!
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	input DeliveryAreaInput {
		id: ID
		distance: Int
		price: Float
		name: String
		center: GeoPoint
		radius: Float
	}

	extend type Mutation {
		checkDeliveryLocation(companyId: ID!, location: GeoPoint, address: AddressInput): DeliveryArea!
		modifyDeliveryAreas(data: [DeliveryAreaInput]!): [DeliveryArea]!
		removeDeliveryArea(id: ID!): DeliveryArea!
	}
`;

export const resolvers =  {
	Mutation: {
		async checkDeliveryLocation (_, { companyId, location, address }) {
			// fix to update the app afterwards
			if (!location && address) location = address.location;

			// load
			const company = await Company.findByPk(companyId);

			// transform points
			const userPoint = pointFromCoordinates(location.coordinates);

			// user addres && companies
			const [deliveryArea] = await company.getDeliveryAreas({
				order: [['radius', 'ASC']],
				limit: 1,
				where: where(fn('ST_Distance_Sphere', userPoint, col('center')), '<=', literal('radius')),
			})

			// case delivery area's not found
			if (!deliveryArea) throw new ApolloError(`${company.displayName} não faz entregas para esse endereço`, 'DELIVERY_LOCATION');

			//return delivery area
			return deliveryArea;
		},
		modifyDeliveryAreas: (_, { data }, { company }) => {
			const update = data.filter(row=>row.id);
			const create = data.filter(row=>!row.id);

			return conn.transaction(async (transaction) => {

				const resultCreate = await Promise.all(create.map(area=>{
					return company.createDeliveryArea(area, { transaction });
				}))
				
				const resultUpdate = await Promise.all(update.map(area=>{
					return company.getDeliveryAreas({ where: { id: area.id } })
						.then(([areaFound])=>{
							if (!areaFound) throw new Error('Área de entrega não encontrada');
						
							return areaFound.update(area, { field: ['center', 'radius', 'name', 'price'], transaction });
						})
				}));

				return [...resultCreate, ...resultUpdate];
			})
		},
		removeDeliveryArea: async (_, { id }, { company }) => {
			// check if delivery area exists
			const [deliveryArea] = await company.getDeliveryAreas({ where: { id } })
			if (!deliveryArea) throw new Error('Área de entrega não encontrada');

			// remove it
			return deliveryArea.destroy();
		},
	}
}