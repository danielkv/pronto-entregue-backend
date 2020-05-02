import { gql }  from 'apollo-server';
import { col } from 'sequelize';

import { categoryProductsKey } from '../cache/keys';
import { upload }  from '../controller/uploads';
import Category  from '../model/category';
import Company from '../model/company';
import Option from '../model/option';
import OptionsGroup from '../model/optionsGroup';
import Product from '../model/product';
import sequelize  from '../services/connection';
import { sanitizeFilter, getSQLPagination } from '../utilities'

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
		category(id: ID!): Category!
		categories(filter: Filter, pagination: Pagination): [Category]!
		loadCompanyCategories(filter: JSON): [Category]!
	}

	extend type Mutation {
		createCategory(data: CategoryInput!): Category! @hasRole(permission: "products_edit")
		updateCategory(id: ID!, data: CategoryInput!): Category! @hasRole(permission: "products_edit")
		updateCategoriesOrder(data: [CategoryInput!]!): [Category!]! @hasRole(permission: "products_edit")
	}
`;

export const resolvers =  {
	Mutation: {
		async createCategory (_, { data }, { company }) {
			if (data.file) {
				data.image = await upload('categories', await data.file);
			}

			return company.createCategory(data);
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
		loadCompanyCategories(_, { filter }) {
			const where = sanitizeFilter(filter, { search: ['name'] });

			return Category.findAll({
				where,
				order: [['order', 'ASC'], [col('products.name'), 'ASC']],
				include: [{
					model: Product,
					where: { active: true },
					include: [
						{
							model: OptionsGroup,
							required: false,
							where: { active: true },
							include: [{
								model: Option,
								where: { active: true }
							}]
						},
						{
							model: Company
						}
					]
				}]
			})
		},

		categories(_, { filter, pagination }) {
			const where = sanitizeFilter(filter, { search: ['name'] });

			return Category.findAll({
				where,
				...getSQLPagination(pagination)
			})
		},
		async category(_, { id }) {
			// check if category exists
			const category = await Category.findByPk(id);
			if (!category) throw new Error('Categoria não encontrada');
			
			return category;
		},
	},
	Category: {
		async products(parent, { filter }) {
			if (parent.products) return parent.products;
			
			const categoryId = parent.get('id');
			const where = sanitizeFilter(filter, { search: ['name'] });

			//return parent.getProducts({ where });
			return await Product.cache(categoryProductsKey(`${categoryId}:${JSON.stringify(filter)}`)).findAll({
				where: [where, { categoryId }],
				order: [['name', 'ASC']]
			})
		},
		async countProducts(parent, { filter }) {
			if (parent.products) return parent.get('products').length;

			const categoryId = parent.get('id');
			const where = sanitizeFilter(filter, { search: ['name'] });

			const products = await Product.cache(categoryProductsKey(`${categoryId}:${JSON.stringify(filter)}`)).findAll({
				where: [where, { categoryId }],
				order: [['name', 'ASC']]
			})

			return products.length;
		}
	}
}