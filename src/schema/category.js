import { gql }  from 'apollo-server';

import { upload }  from '../controller/uploads';
import Category  from '../model/category';
import sequelize  from '../services/connection';


export const typeDefs =  gql`
	type Category {
		id: ID!
		name: String!
		description: String
		active: Boolean!
		image: String!
		order: Int!
		createdAt: DateTime!
		updatedAt: DateTime!
		productsQty(filter: Filter): Int!

		products(filter: Filter): [Product]!
	}

	input CategoryInput {
		id: ID
		name: String
		description: String
		file: Upload
		active: Boolean
		order: Int
	}

	extend type Query {
		category(id: ID!): Category!
	}

	extend type Mutation {
		createCategory(data: CategoryInput!): Category! @hasRole(permission: "productsEdit", scope: "adm")
		updateCategory(id: ID!, data: CategoryInput!): Category! @hasRole(permission: "productsEdit", scope: "adm")
		updateCategoriesOrder(data: [CategoryInput!]!): [Category!]! @hasRole(permission: "productsEdit", scope: "adm")
	}
`;

export const resolvers =  {
	Mutation: {
		createCategory: async (_, { data }) => {
			if (data.file) {
				data.image = await upload('categories', await data.file);
			}

			return Category.create(data);
		},
		updateCategory: async (_, { id, data }) => {
			if (data.file) {
				data.image = await upload('categories', await data.file);
			}

			// check id category exists
			const category = await Category.findByPk(id);
			if (!category) throw new Error('Categoria não encontrada');

			return category.update(data, { fields: ['name', 'description', 'image', 'active'] });
		},
		updateCategoriesOrder: (_, { data }) => {
			return sequelize.transaction(transaction=>{
				return Promise.all(data.map(categoryObj => {
					return Category.findByPk(categoryObj.id).then(category=>{
						if (!category) throw new Error('Categoria não encontrada');

						return category.update({ order: categoryObj.order }, { transaction })
					});
				}))
			});
		}
	},
	Query: {
		category: (_, { id }) => {
			return Category.findByPk(id)
				.then(category => {
					if (!category) throw new Error('Categoria não encontrada');
					return category;
				})
		},
	},
	Category: {
		products: (parent, { filter }) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return parent.getProducts({ where });
		},
		productsQty: (parent, { filter }) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return parent.getProducts({ where })
				.then (products=>products.length);
		}
	}
}