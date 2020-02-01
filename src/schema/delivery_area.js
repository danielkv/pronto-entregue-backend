import { gql }  from 'apollo-server';
import { fn, where, literal }  from 'sequelize';

import sequelize  from '../services/connection';
import { DeliveryAreaError }  from '../utilities/errors';

export const typeDefs =  gql`
	type DeliveryArea {
		id: ID!
		distance: Int!
		price: Float!
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	input DeliveryAreaInput {
		id: ID
		distance: Int
		price: Float
	}

	extend type Mutation {
		calculateDeliveryPrice(location: GeoPoint!): DeliveryArea!
		modifyDeliveryAreas(data: [DeliveryAreaInput]!): [DeliveryArea]!
		removeDeliveryArea(id: ID!): DeliveryArea!
	}
`;

export const resolvers =  {
	Mutation: {
		calculateDeliveryPrice: async (_, { location }, { company }) => {
			const companyAddress = await company.getAddress();
			const companyPoint = fn('ST_GeomFromText', literal(`'POINT(${companyAddress.location.coordinates[0]} ${companyAddress.location.coordinates[1]})'`));
			const userPoint = fn('ST_GeomFromText', literal(`'POINT(${location.coordinates[0]} ${location.coordinates[1]})'`));

			const [deliveryArea] = await company.getDeliveryAreas({
				order: [['distance', 'ASC']],
				limit: 1,
				where: where(fn('ST_Distance_Sphere', userPoint, companyPoint), '<', literal('distance * 1000')),
			})
					
			// check if delivery area exists
			if (!deliveryArea) throw new DeliveryAreaError('Não há entregas para esse local');
		
			return deliveryArea;
		},
		modifyDeliveryAreas: (_, { data }, { company }) => {
			const update = data.filter(row=>row.id);
			const create = data.filter(row=>!row.id);

			return sequelize.transaction(async (transaction) => {

				const resultCreate = await Promise.all(create.map(area=>{
					return company.createDeliveryArea(area, { transaction });
				}))
				
				const resultUpdate = await Promise.all(update.map(area=>{
					return company.getDeliveryAreas({ where: { id: area.id } })
						.then(([areaFound])=>{
							if (!areaFound) throw new Error('Área de entrega não encontrada');
						
							return areaFound.update(area, { field: ['distance', 'price'], transaction });
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