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
		branch: Branch!
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
		createCategory: async (_, { data }, ctx) => {
			if (data.file) {
				data.image = await upload(ctx.company.name, await data.file);
			}

			return ctx.branch.createCategory(data);
		},
		updateCategory: async (_, { id, data }, ctx) => {
			if (data.file) {
				data.image = await upload(ctx.company.name, await data.file);
			}

			return ctx.branch.getCategories({ where: { id } })
				.then (([category])=>{
					if (!category) throw new Error('Categoria não encontrada');

					return category.update(data, { fields: ['name', 'description', 'image', 'active'] });
				})
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
		branch: (parent) => {
			return parent.getBranch();
		},
		productsQty: (parent, { filter }) => {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return parent.getProducts({ where })
				.then (products=>products.length);
		}
	}
}