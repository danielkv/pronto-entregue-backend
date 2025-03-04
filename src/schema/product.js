import { gql }  from 'apollo-server';
import { Op, fn, literal, col } from 'sequelize';

import { loadProductKey } from '../cache/keys';
import ProductController from '../controller/product';
import { productSaleLoader, optionsGroupsLoader } from '../loaders';
import productCategoryLoader from '../loaders/productCategoryLoader';
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
import { CompanyAreaAttribute } from '../utilities/address';
import { getSaleSelection } from '../utilities/product';

export const typeDefs =  gql`
	type Product {
		id: ID!
		name: String!
		description: String
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

		minDeliveryTime: Int
		scheduleEnabled: Boolean

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
		minDeliveryTime: Int
		scheduleEnabled: Boolean
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
				where: { ...where,	active: true },
				having: { [Op.or]: [{ 'company.typeDelivery': true }, { 'company.typePickUp': true }] },
				include: [{
					attributes: { include: [CompanyAreaAttribute('typeDelivery', location), CompanyAreaAttribute('typePickUp', location)] },
					model: Company,
					where: { active: true, published: true },
					required: true,
					include: [Rating],
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
		createProduct(_, { data }, ctx) {
			return conn.transaction(async (transaction) => {
				// update product
				const product = await ProductController.create(data, { transaction }, ctx);
					
				return product;
			})
		},
		updateProduct(_, { id, data }, ctx) {
			return conn.transaction(async (transaction) => {
				// check if product exists
				const product = await Product.findByPk(id);
				if (!product) throw new Error('Produto não encontrado');

				// update product
				const productUpdated = await ProductController.update(product, data, { transaction }, ctx);

				// return
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
		loadProduct(_, { id }) {
			//const optionsGroupsWhere = sanitizeFilter(info.variableValues.filter);

			return Product.cache(loadProductKey(id)).findOne({
				where: { id },
				include: [
					Category,
					{
						model: Sale,
						...getSaleSelection()
					}
				]
			})
		},
		async product(_, { id }) {
			// check if product exists
			const product = await Product.cache().findByPk(id);
			if (!product) throw new Error('Produto não encontrada');

			return product;
		},
		/**
		 * Retorna produtos em promoção, ela não verifica se promoção está em progresso ou não
		 * DEVE SER USADO APENAS NO APP
		 */
		productsOnSale(_, { limit, location }) {
			return Product.findAll({
				where: { active: true },
				having: { [Op.or]: [{ 'company.typeDelivery': true }, { 'company.typePickUp': true }] },
				include: [
					{
						model: Company,
						attributes: { include: [CompanyAreaAttribute('typeDelivery', location), CompanyAreaAttribute('typePickUp', location)] },
						where: { active: true, published: true },
						required: true,
					},
					{
						model: Sale,
						required: true,
						attributes: {
							include: [[literal('IF(sales.startsAt <= NOW() AND sales.expiresAt >= NOW() AND sales.active, true, false)'), 'progress']]
						},
						where: {
							removed: false,
							active: true,
							expiresAt: { [Op.gte]: fn('NOW') },
							startsAt: { [Op.lte]: fn('NOW') },
						}
					}
				],
				limit,
				//subQuery: false,
				order: literal('RAND()')
			});
		},
		
		async bestSellers(_, { limit, location }) {
			const products = await Product.findAll({
				
				attributes: { include: [[fn('SUM', col('productRelated.quantity')), 'numberOfOrders']] },
				include: [
					{
						model: OrderProduct,
						as: 'productRelated'
					},
					{
						model: Company,
						attributes: { include: [CompanyAreaAttribute('typeDelivery', location), CompanyAreaAttribute('typePickUp', location)] },
						where: { published: true, active: true },
						required: true,
					}
				],
				
				order: [
					[col('numberOfOrders'), 'DESC'],
					[fn('RAND')]
				],
				group: ['product.id'],
				where: { active: true },
				having: { [Op.or]: [{ 'company.typeDelivery': true }, { 'company.typePickUp': true }] },
				//subQuery: false,
				limit
			});

			return products
		},
	},
	Product: {
		countOptions(parent, { filter }) {
			const where = sanitizeFilter(filter, { defaultFilter: { removed: false } });

			return Option.count({ where, include: [{ model: OptionsGroup, where: { productId: parent.get('id') } }] });
		},
		optionsGroups(parent, { filter }) {
			if (parent.optionsGroups) return parent.optionsGroups;

			const productId = parent.get('id');

			if (!filter) return optionsGroupsLoader.load(productId);

			const where = sanitizeFilter(filter, { defaultFilter: { removed: false } });
			
			return parent.getOptionsGroups({
				where,
				order: [['order', 'ASC']]
			})
			
		},
		category(parent) {
			if (parent.category) return parent.get('category');
			
			const categoryId = parent.get('categoryId');
			//return parent.getCategory();
			return productCategoryLoader.load(categoryId);
		},
		countFavoritedBy(parent) {
			return parent.countFavoritedBy();
		},
		favoritedBy(parent, { pagination }) {
			return parent.getFavoritedBy({
				...getSQLPagination(pagination)
			});
		},

		async sale(parent) {
			if (parent.sales) return parent.sales[0];

			return productSaleLoader.load(parent.get('id'));

			/* const [sale] = await parent.getSales({
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
			
			return sale; */
		}
	}
}