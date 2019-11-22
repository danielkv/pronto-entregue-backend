const {gql} = require('apollo-server');
const sequelize = require('../services/connection');
const {Op, col, fn} = require('sequelize');
const {ZipcodeError} = require('../utilities/errors');

module.exports.typeDefs = gql`
	type DeliveryArea {
		id:ID!
		name:String!
		type:String!
		price:Float!
		zipcode_a: Int!
		zipcode_b: Int
		createdAt:String!
		updatedAt:String!
	}

	input DeliveryAreaInput {
		id: ID
		name: String
		type: String
		price: Float
		zipcode_a: Int
		zipcode_b: Int
	}

	extend type Query {
		calculateDeliveryPrice(zipcode: Int!): DeliveryArea!
	}

	extend type Mutation {
		modifyDeliveryAreas(data:[DeliveryAreaInput]!):[DeliveryArea]!
		removeDeliveryArea(id:ID!):DeliveryArea!
	}
`;

module.exports.resolvers = {
	Query: {
		calculateDeliveryPrice: (parent, {zipcode}, ctx) => {
			return ctx.branch.getDeliveryAreas({
				order:[['price', 'DESC']],
				limit: 1,
				where: {
					[Op.or] : [
						{type: 'single', zipcode_a: zipcode},
						{type: 'set', zipcode_a: {[Op.lte]: zipcode}, zipcode_b: {[Op.gte]: zipcode}},
						{type: 'joker', zipcode_a: fn('substring', zipcode, 1, fn('char_length', col('zipcode_a')))},
					]
				}
			})
			.then(([area])=>{
				if (!area) throw new ZipcodeError('Não há entregas para esse local');

				return area;
			})
		},
	},
	Mutation : {
		modifyDeliveryAreas: (parent, {data}, ctx) => {
			const update = data.filter(row=>row.id);
			const create = data.filter(row=>!row.id);

			return sequelize.transaction(async (transaction) => {

				const resultCreate = await Promise.all(create.map(area=>{
					return ctx.branch.createDeliveryArea(area, {transaction});
				}))
				
				const resultUpdate = await Promise.all(update.map(area=>{
					return ctx.branch.getDeliveryAreas({where:{id:area.id}})
					.then(([area_found])=>{
						if (!area_found) throw new Error('Área de entrega não encontrada');
						
						return area_found.update(area, {field:['name', 'type', 'zipcode_a', 'zipcode_b', 'price'], transaction});
					})
				}));

				return [...resultCreate, ...resultUpdate];
			})
		},
		removeDeliveryArea: (parent, {id}, ctx) => {
			return ctx.branch.getDeliveryAreas({where:{id}})
			.then (([delivery_area]) => {
				if (!delivery_area) throw new Error('Área de entrega não encontrada');

				return delivery_area.destroy();
			});
		},
	}
}