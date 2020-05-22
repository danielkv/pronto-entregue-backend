import { gql }  from 'apollo-server';

import conn from '../services/connection';

export const typeDefs =  gql`
	type ViewArea {
		id: ID!
		name: String
		active: Boolean!
		center: GeoPoint
		radius: Float
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	input ViewAreaInput {
		id: ID
		name: String
		active: Boolean
		center: GeoPoint
		radius: Float
	}

	extend type Company {
		viewAreas: [ViewArea]!
	}

	extend type Mutation {
		modifyViewAreas(data: [ViewAreaInput]!): [ViewArea]!
		removeViewArea(id: ID!): ViewArea!
	}
`;

export const resolvers =  {
	Company: {
		viewAreas(parent) {
			return parent.getViewAreas();
		}
	},
	Mutation: {
		modifyViewAreas: (_, { data }, { company }) => {
			const update = data.filter(row=>row.id);
			const create = data.filter(row=>!row.id);

			return conn.transaction(async (transaction) => {

				const resultCreate = await Promise.all(create.map(area=>{
					return company.createViewArea(area, { transaction });
				}))
				
				const resultUpdate = await Promise.all(update.map(area=>{
					return company.getViewAreas({ where: { id: area.id } })
						.then(([areaFound])=>{
							if (!areaFound) throw new Error('Área de vizualização não encontrada');
						
							return areaFound.update(area, { field: ['center', 'radius', 'name', 'active'], transaction });
						})
				}));

				return [...resultCreate, ...resultUpdate];
			})
		},
		removeViewArea: async (_, { id }, { company }) => {
			// check if delivery area exists
			const [ViewArea] = await company.getViewAreas({ where: { id } })
			if (!ViewArea) throw new Error('Área de vizualização não encontrada');

			// remove it
			return ViewArea.destroy();
		},
	}
}