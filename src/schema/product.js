import { gql }  from 'apollo-server';
import { Op, fn, literal } from 'sequelize';

import { upload }  from '../controller/uploads';
import Campaign from '../model/campaign';
import Category from '../model/category';
import Company from '../model/company';
import Option  from '../model/option';
import OptionsGroup  from '../model/OptionsGroup';
import OrderProduct from '../model/orderProduct';
import Product  from '../model/product';
import User from '../model/user';
import conn  from '../services/connection';
import { getSQLPagination, sanitizeFilter } from '../utilities';
import { campaignProductWhere } from '../utilities/campaign';

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
		fromPrice: Float!

		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!

		optionsGroups(filter: Filter): [OptionsGroup]!
		
		countOptions(filter: Filter): Int!

		countFavoritedBy: Int!
		favoritedBy(pagination: Pagination): [User]!
		
		category: Category!
		company: Company!

		countCampaigns(notIn: [ID]): Int!
		campaigns(notIn: [ID]): [Campaign]!

		sale: Sale
	}

	input ProductInput {
		name: String
		description: String
		file: Upload
		type: String
		price: Float
		fromPrice: Float
		active: Boolean
		categoryId: ID
		optionsGroups: [OptionsGroupInput]
		sale: SaleInput
	}

	extend type Query {
		product(id: ID!): Product!
		bestSellers(limit: Int!): [Product]! @isAuthenticated
	}

	extend type Mutation {
		searchProducts(search: String, exclude: [ID], companies: [ID]): [Product]!

		createProduct(data: ProductInput!): Product! @hasRole(permission: "users_edit")
		updateProduct(id: ID!, data: ProductInput!): Product! @hasRole(permission: "users_edit")

		addFavoriteProduct(productId: ID!, userId: ID!): Product!
		removeFavoriteProduct(productId: ID!, userId: ID!): Product!
	}
`;

export const resolvers =  {
	Mutation: {
		searchProducts(_, { search, exclude = [], companies }) {
			const where = sanitizeFilter({ search }, { search: ['name', 'description', '$company.name$', '$company.displayName$'] });
			if (companies) where['$company.id$'] = companies;

			return Product.findAll({
				where: { ...where, active: true, id: { [Op.notIn]: exclude } },
				include: [Company]
			});
		},
		createProduct(_, { data }, { company }) {
			return conn.transaction(async (transaction) => {
				if (data.file) data.image = await upload(company.name, await data.file);

				// check if selected category exists
				const category = await Category.findByPk(data.categoryId)
				if (!category) throw new Error('Categoria não encontrada');

				// create product
				const product = await category.createProduct(data, { transaction });

				// create options groups
				if (data.optionsGroups) await OptionsGroup.updateAll(data.optionsGroups, product, transaction);

				// sales
				if (data.sale) await product.createSale(data.sale, { transaction });
					
				return product;
			})
		},
		updateProduct(_, { id, data }, { company }) {
			return conn.transaction(async (transaction) => {
				// product image
				if (data.file) data.image = await upload(company.name, await data.file);

				// check if product exists
				const product = await Product.findByPk(id);
				if (!product) throw new Error('Produto não encontrado');

				// update product
				const productUpdated = await product.update(data, { fields: ['name', 'description', 'price', 'fromPrice', 'order', 'active', 'image', 'type', 'categoryId'], transaction });

				// create, update, remove options groups
				if (data.optionsGroups) await OptionsGroup.updateAll(data.optionsGroups, productUpdated, transaction);

				// sales
				if (data.sale) await productUpdated.createSale(data.sale, { transaction });
			
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
		async bestSellers(_, { limit }) {
			const products = await Product.findAll({
				include: [{
					model: OrderProduct,
					// required: true,
				}],
				
				order: [
					[conn.fn('COUNT', conn.col('orderProduct.id')), 'DESC'],
					[conn.col('product.name'), 'ASC']
				],
				group: ['product.id'],
				where: {},
				limit
			});

			return products
		},
	},
	Product: {
		countOptions(parent, { filter }) {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;

			return Option.count({ where, include: [{ model: OptionsGroup, where: { productId: parent.get('id') } }] });
		},
		optionsGroups(parent, { filter }) {
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;
			return parent.getOptionsGroups({ where, order: [['order', 'ASC']] });
		},
		category(parent) {
			return parent.getCategory();
		},
		countFavoritedBy(parent) {
			return parent.countFavoritedBy();
		},
		favoritedBy(parent, { pagination }) {
			return parent.getFavoritedBy({
				...getSQLPagination(pagination)
			});
		},
		company (parent) {
			return parent.getCompany();
		},
		countCampaigns(parent, { notIn = {} }) {
			// count all realted campaigns
			return Campaign.count({
				where: {
					...campaignProductWhere(parent),
					id: { [Op.notIn]: notIn }
				},
				include: [Product, Company]
			})
		},
		campaigns(parent, { notIn = {} }) {
			// get all realted campaigns
			return Campaign.findAll({
				where: {
					...campaignProductWhere(parent),
					id: { [Op.notIn]: notIn }
				},
				include: [Product, Company]
			})
		},

		async sale(parent) {
			const [sale] = await parent.getSales({
				attributes: {
					include: [[literal('IF(startsAt <= NOW() AND expiresAt >= NOW() AND active, true, false)'), 'progress']]
				},
				where: {
					[Op.or]: [{
						expiresAt: { [Op.gte]: fn('NOW') },
						startsAt: { [Op.lte]: fn('NOW') },
					}, {
						startsAt: { [Op.gt]: fn('NOW') },
					}],
					removed: false
				},
				order: [['startsAt', 'ASC'], ['createdAt', 'DESC']],
				limit: 1
			})
			
			return sale;
		}
	}
}