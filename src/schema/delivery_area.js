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
		createdAt: String!
		updatedAt: String!
	}

	input DeliveryAreaInput {
		id: ID
		name: String
		type: String
		price: Float
		zipcodeA: Int
		zipcodeB: Int
	}

	extend type Query {
		calculateDeliveryPrice(zipcode: Int!): DeliveryArea!
	}

	extend type Mutation {
		modifyDeliveryAreas(data: [DeliveryAreaInput]!): [DeliveryArea]!
		removeDeliveryArea(id: ID!): DeliveryArea!
	}
`;

export const resolvers =  {
	Query: {
		calculateDeliveryPrice: (parent, { zipcode }, ctx) => {
			return ctx.branch.getDeliveryAreas({
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
				.then(([area])=>{
					if (!area) throw new ZipcodeError('Não há entregas para esse local');

					return area;
				})
		},
	},
	Mutation: {
		modifyDeliveryAreas: (parent, { data }, ctx) => {
			const update = data.filter(row=>row.id);
			const create = data.filter(row=>!row.id);

			return sequelize.transaction(async (transaction) => {

				const resultCreate = await Promise.all(create.map(area=>{
					return ctx.branch.createDeliveryArea(area, { transaction });
				}))
				
				const resultUpdate = await Promise.all(update.map(area=>{
					return ctx.branch.getDeliveryAreas({ where: { id: area.id } })
						.then(([areaFound])=>{
							if (!areaFound) throw new Error('Área de entrega não encontrada');
						
							return areaFound.update(area, { field: ['name', 'type', 'zipcodeA', 'zipcodeB', 'price'], transaction });
						})
				}));

				return [...resultCreate, ...resultUpdate];
			})
		},
		removeDeliveryArea: (parent, { id }, ctx) => {
			return ctx.branch.getDeliveryAreas({ where: { id } })
				.then (([deliveryArea]) => {
					if (!deliveryArea) throw new Error('Área de entrega não encontrada');

					return deliveryArea.destroy();
				});
		},
	}
}