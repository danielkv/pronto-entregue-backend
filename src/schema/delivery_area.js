import { gql }  from 'apollo-server';
import { Op, col, fn }  from 'sequelize';

import sequelize  from '../services/connection';
import { ZipcodeError }  from '../utilities/errors';

export const typeDefs =  gql`
	type DeliveryArea {
		id: ID!
		name: String!
		type: String!
		price: Float!
		zipcodeA: Int!
		zipcodeB: Int
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	input DeliveryAreaInput {
		id: ID
		name: String
		type: String
		price: Float
		zipcodeA: Int
		zipcodeB: Int
	}

	extend type Mutation {
		calculateDeliveryPrice(zipcode: Int!): DeliveryArea!
		modifyDeliveryAreas(data: [DeliveryAreaInput]!): [DeliveryArea]!
		removeDeliveryArea(id: ID!): DeliveryArea!
	}
`;

export const resolvers =  {
	Mutation: {
		calculateDeliveryPrice: async (_, { zipcode }, { company }) => {
			const [deliveryArea] = await company.getDeliveryAreas({
				order: [['price', 'DESC']],
				limit: 1,
				where: {
					[Op.or]: [
						{ type: 'single', zipcodeA: zipcode },
						{ type: 'set', zipcodeA: { [Op.lte]: zipcode }, zipcodeB: { [Op.gte]: zipcode } },
						{ type: 'joker', zipcodeA: fn('substring', zipcode, 1, fn('char_length', col('zipcodeA'))) },
					]
				}
			})
					
			// check if delivery area exists
			if (!deliveryArea) throw new ZipcodeError('Não há entregas para esse local');
		
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
						
							return areaFound.update(area, { field: ['name', 'type', 'zipcodeA', 'zipcodeB', 'price'], transaction });
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