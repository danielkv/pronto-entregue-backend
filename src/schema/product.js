import { gql }  from 'apollo-server';
import { Op, fn, literal, col } from 'sequelize';

import { upload }  from '../controller/uploads';
import Address from '../model/address';
import Campaign from '../model/campaign';
import Category from '../model/category';
import Company from '../model/company';
import Option  from '../model/option';
import OptionsGroup  from '../model/optionsGroup';
import OrderProduct from '../model/orderProduct';
import Product  from '../model/product';
import Rating from '../model/rating';
import Sale from '../model/sale';
import User from '../model/user';
import conn  from '../services/connection';
import { getSQLPagination, sanitizeFilter } from '../utilities';
import { whereCompanyDistance } from '../utilities/address';
import { campaignProductWhere } from '../utilities/campaign';
import { getSaleSelection } from '../utilities/product';

export const typeDefs =  gql`
	type Product {
		id: ID!
		name: String!
		description: String!
		sku: String
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
		sku: String
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
		bestSellers(limit: Int!, location: GeoPoint!): [Product]!
		productsOnSale(limit: Int!, location: GeoPoint!): [Product]!
		loadProduct(id: ID!, filter: JSON): Product!
	}

	extend type Mutation {
		# search on APP
		searchProductsOnApp(search: String!, location: GeoPoint!): [Product]!

		# search on ADM
		searchProducts(search: String, exclude: [ID], companies: [ID]): [Product]! @hasRole(permission: "products_edit")

		createProduct(data: ProductInput!): Product! @hasRole(permission: "products_edit")
		updateProduct(id: ID!, data: ProductInput!): Product! @hasRole(permission: "products_edit")

		addFavoriteProduct(productId: ID!, userId: ID!): Product! @isAuthenticated
		removeFavoriteProduct(productId: ID!, userId: ID!): Product! @isAuthenticated
	}
`;

export const resolvers =  {
	Mutation: {
		/**
		 * DEVE SER USADO APENAS NO APP
		 */
		searchProductsOnApp(_, { search, location }) {
			const where = sanitizeFilter({ search }, { search: ['name', 'description'] });
			
			return Product.findAll({
				attributes: {
					include: [[fn('SUM', col('company.ratings.rate')), 'totalRate']]
				},
				where: {
					[Op.and]: [
						whereCompanyDistance(location, 'company'),
						{ ...where,	active: true }
					]
				},
				include: [{
					model: Company,
					where: { active: true, published: true },
					required: true,
					include: [
						{
							model: Address,
							required: true,
						},
						Rating
					],
				}],
				order: [[col('totalRate'), 'DESC'], [col('product.name'), 'ASC']],
				group: 'product.id',
				subQuery: false,
				limit: 10,
			});
		},
		searchProducts(_, { search, exclude = [], companies }) {
			const where = sanitizeFilter({ search }, { search: ['name', 'description', 'sku', '$company.name$', '$company.displayName$'] });
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
				const product = await category.createProduct({ ...data, companyId: company.get('id') }, { transaction });

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
				const productUpdated = await product.update(data, { fields: ['name', 'description', 'sku', 'price', 'fromPrice', 'order', 'active', 'image', 'type', 'categoryId'], transaction });

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
			await user.addFavoriteProduct(product);

			return product;
		},
		async removeFavoriteProduct(_, { productId, userId }) {
			// check if product exists
			const product = await Product.findByPk(productId);
			if (!product) throw new Error('Produto não encontrado');
			
			// check if user exists
			const user = await User.findByPk(userId);
			if (!user) throw new Error('Usuário não encontrado');

			//remove favorite product
			await user.removeFavoriteProduct(product);

			return product;
		},
	},
	Query: {
		loadProduct(_, { id }, __, info) {
			const optionsGroupsWhere = sanitizeFilter(info.variableValues.filter);

			return Product.findOne({
				where: { id },
				include: [
					Category,
					{
						model: Sale,
						...getSaleSelection()
					},
					{
						model: OptionsGroup,
						required: false,
						where: optionsGroupsWhere,
						include: [
							Option,
							{
								model: OptionsGroup,
								as: 'groupRestrained',
							},
							{
								model: OptionsGroup,
								as: 'restrainedBy',
							}
						]
					}
				]
			})
		},
		async product(_, { id }) {
			// check if product exists
			const product = await Product.findByPk(id);
			if (!product) throw new Error('Produto não encontrada');

			return product;
		},
		/**
		 * Retorna produtos em promoção, ela não verifica se promoção está em progresso ou não
		 * DEVE SER USADO APENAS NO APP
		 */
		productsOnSale(_, { limit, location }) {
			return Product.findAll({
				where: {
					[Op.and]: [
						whereCompanyDistance(location),
						{ active: true }
					]
				},
				include: [
					{
						model: Company,
						where: { active: true, published: true },
						include: [
							{
								model: Address,
								required: true,
							},
						],
					},
					{
						model: Sale,
						required: true,
						where: {
							removed: false,
							active: true,
							expiresAt: { [Op.gte]: fn('NOW') },
							startsAt: { [Op.lte]: fn('NOW') },
						}
					}
				],
				limit,
				subQuery: false,
				order: literal('RAND()')
			});
		},
		
		async bestSellers(_, { limit, location }) {
			const products = await Product.findAll({
				include: [
					OrderProduct,
					{
						model: Sale,
						...getSaleSelection()
					},
					{
						model: Company,
						where: { published: true, active: true },
						required: true,
						include: [{ model: Address, required: true }]
					}
				],
				
				order: [
					[conn.fn('COUNT', conn.col('orderProduct.id')), 'DESC'],
					[conn.col('product.name'), 'ASC']
				],
				group: ['product.id'],
				where: [whereCompanyDistance(location, 'company'), { active: true }],
				subQuery: false,
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
			if (parent.optionsGroups) return parent.optionsGroups;
			
			let where = { active: true };
			if (filter && filter.showInactive) delete where.active;
			return parent.getOptionsGroups({ where, order: [['order', 'ASC']] });
		},
		category(parent) {
			if (parent.category) return parent.get('category');

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
			if (parent.company) return parent.company;

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
			if (parent.sales) return parent.sales[0];

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