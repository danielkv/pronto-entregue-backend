import { gql }  from 'apollo-server';

import { upload }  from '../controller/uploads';
import Category from '../model/category';
import Option  from '../model/option';
import OptionsGroup  from '../model/OptionsGroup';
import Product  from '../model/product';
import conn  from '../services/connection';
import { getSQLPagination } from '../utilities';
import User from '../model/user';

export const typeDefs =  gql`
	type Product {
		id: ID!
		name: String!
		description: String!
		image: String!
		order: Int!
		type: String!
		listed: Boolean!
		price: Float!
		featured: Boolean!

		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!

		optionsQty(filter: Filter): Int!
		optionGroups(filter: Filter): [OptionsGroup]!
		category: Category!

		favoritedBy(pagination: Pagination): [User]!
	}

	input ProductInput {
		name: String
		description: String
		featured: Boolean
		file: Upload
		type: String
		price: Float
		active: Boolean
		categoryId: ID
		optionGroups: [OptionsGroupInput]
	}

	extend type Query {
		product(id: ID!): Product!
	}

	extend type Mutation {
		createProduct(data: ProductInput!): Product! @hasRole(permission: "users_edit", scope: "adm")
		updateProduct(id: ID!, data: ProductInput!): Product! @hasRole(permission: "users_edit", scope: "adm")

		addFavoriteProduct(productId: ID!, userId: ID!): Product!
		removeFavoriteProduct(productId: ID!, userId: ID!): Product!
	}
`;

export const resolvers =  {
	Mutation: {
		async createProduct(_, { data }, { company }) {
			if (data.file) {
				data.image = await upload(company.name, await data.file);
			}

			return conn.transaction(async (transaction) => {
				// check if selected category exists
				const category = await Category.findByPk(data.categoryId)
				if (!category) throw new Error('Categoria não encontrada');

				// create product
				const product = await category.createProduct(data, { transaction });

				// create options groups
				if (data.optionGroups) await OptionsGroup.updateAll(data.optionGroups, product, transaction);
					
				return product;
			})
		},
		async updateProduct(_, { id, data }, { company }) {
			if (data.file) {
				data.image = await upload(company.name, await data.file);
			}

			return conn.transaction(async (transaction) => {
				// check if product exists
				const product = await Product.findByPk(id);
				if (!product) throw new Error('Produto não encontrado');

				// update product
				const productUpdated = await product.update(data, { fields: ['name', 'description', 'price', 'order', 'featured', 'active', 'image', 'type'], transaction });
					
				// check if needs to update category
				if (data.categoryId) {
					// check if selected category exists
					const category = await Category.findByPk(data.categoryId)
					if (!category) throw new Error('Categoria não encontrada');

					// update category
					await productUpdated.setCategory(category, { transaction });
				}

				// create, update, remove options groups
				if (data.optionGroups) await OptionsGroup.updateAll(data.optionGroups, product, transaction);
			
				return productUpdated;
			})
		},
		async addFavoriteProduct(_, { productId, userId }) {
			// check if product exists
			const product = await Product.findByPk(productId);
			if (!product) throw new Error('Produto não encontrado');
			
			// check if user exists
			const user = await User.findByPk(userId);
			if (!user) throw new Error('Usuário não encontrado');

			//add favorite product
			user.addFavoriteProduct(product);

			return product;
		},
		async removeFavoriteProduct(_, { productId, userId }) {
			// check if product exists
			const product = await Product.findByPk(productId);
			if (!product) throw new Error('Produto não encontrado');
			
			// check if user exists
			const user = await User.findByPk(userId);
			if (!user) throw new Error('Usuário não encontrado');

			//add favorite product
			user.removeFavoriteProduct(product);

			return product;
		},
	},
	Query: {
		async product(_, { id }) {
			// check if product exists
			const product = await Product.findByPk(id);
			if (!product) throw new Error('Produto não encontrada');

			return product;
		},
	},
	Product: {
		optionsQty(parent, { filter }) {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return Option.count({ where, include: [{ model: OptionsGroup, where: { productId: parent.get('id') } }] });
		},
		optionGroups(parent, { filter }) {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;
			return parent.getOptionGroup({ where, order: [['order', 'ASC']] });
		},
		category(parent) {
			return parent.getCategory();
		},
		favoritedBy(parent, { pagination }) {
			return parent.getFavoritedBy({
				...getSQLPagination(pagination)
			});
		}
	}
}