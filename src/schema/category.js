import { gql }  from 'apollo-server';

import { upload }  from '../controller/uploads';
import Category  from '../model/category';
import sequelize  from '../services/connection';
import { getSQLPagination, sanitizeFilter } from '../utilities'

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

		countProducts(filter: Filter): Int!
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
		countCategories(filter: Filter): Int!
		categories(filter: Filter, pagination: Pagination): [Category]!
		category(id: ID!): Category!
	}

	extend type Mutation {
		createCategory(data: CategoryInput!): Category! @hasRole(permission: "productsEdit")
		updateCategory(id: ID!, data: CategoryInput!): Category! @hasRole(permission: "productsEdit")
		updateCategoriesOrder(data: [CategoryInput!]!): [Category!]! @hasRole(permission: "productsEdit")
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
		countCategories(_, { filter }) {
			const search = ['name', 'description'];
			const where = sanitizeFilter(filter, { search, table: 'order' });

			return Category.count({ where });
		},
		categories(_, { filter, pagination }) {
			const search = ['name', 'description'];
			const where = sanitizeFilter(filter, { search, table: 'order' });

			return Category.findAll({
				where,
				...getSQLPagination(pagination),
			});
		},
		async category(_, { id }) {
			// check if category exists
			const category = await Category.findByPk(id);
			if (!category) throw new Error('Categoria não encontrada');
			
			return category;
		},
	},
	Category: {
		products(parent, { filter }) {
			const where = sanitizeFilter(filter);

			return parent.getProducts({ where });
		},
		countProducts(parent, { filter }) {
			const where = sanitizeFilter(filter);

			return parent.countProducts({ where });
		}
	}
}