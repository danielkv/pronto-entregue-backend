import { gql }  from 'apollo-server';

import conn from '../services/connection';

export const typeDefs =  gql`
	type DeliveryArea {
		id: ID!
		name: String
		center: GeoPoint
		active: Boolean!
		radius: Float
		distance: Int
		price: Float!
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	input DeliveryAreaInput {
		id: ID
		distance: Int
		active: Boolean
		price: Float
		name: String
		center: GeoPoint
		radius: Float
	}

	extend type Company {
		deliveryAreas: [DeliveryArea]!
	}

	extend type Mutation {
		modifyDeliveryAreas(data: [DeliveryAreaInput]!): [DeliveryArea]!
		removeDeliveryArea(id: ID!): DeliveryArea!
	}
`;

export const resolvers =  {
	Company: {
		deliveryAreas(parent) {
			return parent.getDeliveryAreas();
		},
	},
	Mutation: {
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
						
							return areaFound.update(area, { field: ['center', 'radius', 'name', 'price', 'active'], transaction });
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