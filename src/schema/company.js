import { gql }  from 'apollo-server';
import { Op, fn, col, where, literal } from 'sequelize';

import { companyRateKey } from '../cache/keys';
import { getOrderStatusQty } from '../controller/order';
import { upload } from '../controller/uploads';
import { deliveryTimeLoader, businessHoursLoader } from '../loaders';
import Address from '../model/address';
import Company  from '../model/company';
import CompanyMeta  from '../model/companyMeta';
import CompanyType from '../model/companyType';
import OrderProduct from '../model/orderProduct';
import Product from '../model/product';
import Rating  from '../model/rating';
import User from '../model/user';
import conn  from '../services/connection';
import { getSQLPagination, sanitizeFilter }  from '../utilities';
import { whereCompanyDistance } from '../utilities/address';
import { calculateDistance } from '../utilities/address'
import { companyIsOpen } from '../utilities/company';

export const typeDefs =  gql`
	type Company {
		id: ID!
		name: String!
		displayName: String!
		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!
		metas(keys: [String]): [Meta]!
		lastMonthRevenue: Float!
		userRelation: CompanyRelation!
		acceptTakeout: Boolean!
		published: Boolean!
		isOpen: Boolean!

		# customization
		image: String
		backgroundColor: String

		rankPosition(radius: Int!): Int!

		address: Address

		type: CompanyType!

		countUsers(filter: Filter): Int! @hasRole(permission: "users_read")
		users(filter: Filter, pagination: Pagination): [User]! @hasRole(permission: "users_read")

		deliveryTime: Int! #minutes

		deliveryAreas: [DeliveryArea]!
		paymentMethods(filter: Filter): [PaymentMethod]!

		bestSellers(filter:Filter, pagination: Pagination): [ProductBestSeller]!

		businessHours: [BusinessHour]!

		countOrders(filter:JSON): Int! @hasRole(permission: "orders_read")
		orders(filter:JSON, pagination: Pagination): [Order]! @hasRole(permission: "orders_read")

		countProducts(filter:Filter): Int!
		products(filter:Filter, pagination: Pagination): [Product]! @hasRole(permission: "products_read")

		countRatings(filter:Filter): Int!
		ratings(filter:Filter, pagination: Pagination): [Rating]!
		rate: Float!

		countCategories(filter: Filter): Int!
		categories(filter: Filter, pagination: Pagination): [Category]!

		distance(location: GeoPoint!): Float! #kilometers
	}

	type ProductBestSeller {
		id: ID!
		name: String!
		image: String!
		qty: Int!
	}	

	input CompanyInput {
		name: String
		displayName: String
		backgroundColor: String
		file: Upload
		companyTypeId: ID
		active: Boolean
		metas: [MetaInput]
		address: AddressInput
		published: Boolean
	}

	type CompanyCustomization {
		color: String!
		background: String!
		logo: String!
	}

	extend type Mutation {
		# Search on APP
		searchCompaniesOnApp(search: String!, location: GeoPoint!): [Company]!
		
		# Search on ADM
		searchCompanies(search: String!, exclude: [ID]): [Company]! @hasRole(permission: "companies_edit")
		createCompany(data: CompanyInput!): Company! @hasRole(permission: "companies_edit")
		updateCompany(id: ID!, data: CompanyInput!): Company! @hasRole(permission: "companies_edit")
	}

	extend type Query {
		company(id: ID!): Company!

		ordersStatusQty(companyId: ID!): JSON!
	}
`;

export const resolvers =  {
	Mutation: {
		/**
		 * DEVE SER USADO APENAS NO APP
		 */
		searchCompaniesOnApp(_, { search, location }) {
			const where = sanitizeFilter({ search }, { search: ['name', 'displayName', '$companyType.name$'] });
			
			return Company.findAll({
				attributes: {
					include: [[fn('SUM', col('ratings.rate')), 'totalRate']]
				},
				where: {
					[Op.and]: [
						whereCompanyDistance(location, 'company', 'address.location'),
						{ ...where,	active: true, published: true }
					]
				},
				include: [
					{
						model: Address,
						required: true,
					},
					Rating,
					CompanyType
				],
				order: [[col('totalRate'), 'DESC'], [col('company.name'), 'ASC']],
				group: 'company.id',
				subQuery: false,
				limit: 10
			});
		},
		searchCompanies(_, { search, exclude = [] }) {
			const where = sanitizeFilter({ search }, { search: ['name', 'displayName'] });

			return Company.findAll({ where: { ...where, active: true, id: { [Op.notIn]: exclude } } });
		},
		async createCompany(_, { data }) {
			if (data.file) data.image = await upload(data.name, await data.file);

			return await Company.create(data, { include: [CompanyMeta, Address] })
		},
		updateCompany(_, { id, data }) {
			return conn.transaction(async transaction => {
				if (data.file) data.image = await upload(data.name, await data.file);

				// check if company exists
				const companyFound = await Company.findByPk(id)
				if (!companyFound) throw new Error('Empresa não encontrada');

				// update company address
				const address = await companyFound.getAddress();
				if (address)
					address.cache().update(data.address);
				else
					companyFound.createAddress(data.address);

				// update company
				const updatedCompany = await companyFound.cache().update(data, { fields: ['name', 'displayName', 'active', 'companyTypeId', 'image', 'backgroundColor', 'published'], transaction })
			
				// check if there are metas to update
				if (data.metas) await CompanyMeta.updateAll(data.metas, updatedCompany, transaction);
				
				return updatedCompany;
			})
		}
	},
	Query: {
		ordersStatusQty(_, { companyId }) {
			return getOrderStatusQty(companyId);
		},
		countCompanies: (_, { filter }) => {
			const where = sanitizeFilter(filter, { search: ['name', 'displayName'], table: 'company' });

			return Company.count({ where });
		},
		companies: (_, { filter, pagination }) => {
			const where = sanitizeFilter(filter, { search: ['name', 'displayName'], table: 'company' });

			return Company.findAll({
				where,
				...getSQLPagination(pagination),
			});
		},
		async company(_, { id }) {
			// check if company exists
			const company = await Company.cache().findByPk(id);
			if (!company) throw new Error('Empresa não encontrada');

			return company;
		},
	},
	Company: {
		address(parent) {
			return parent.getAddress();
		},
		userRelation: (parent) => {
			if (!parent.companyRelation) throw new Error('Nenhum usuário selecionado');

			return parent.companyRelation.get();
		},
		countUsers: (parent, { filter }) => {
			const _filter = sanitizeFilter(filter, { search: ['firstName', 'lastName', 'email'] });

			return parent.countUsers({ where: _filter });
		},
		users: (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter, { search: ['firstName', 'lastName', 'email'] });

			return parent.getUsers({
				where: _filter,
				order: [['firstName', 'ASC'], ['lastName', 'ASC']],
				...getSQLPagination(pagination),
			});
		},
		metas: (parent, { keys }) => {
			if (keys)
				return parent.getMetas({ where: { key: keys } });
			
			return parent.getMetas();
		},
		lastMonthRevenue: () => {
			return 0;
		},
		async deliveryTime(parent) {
			const meta = await deliveryTimeLoader.load(parent.get('id'));
			
			return meta;
		},
		async bestSellers(_, { filter, pagination }) {
			const where = sanitizeFilter(filter, { table: 'orderproduct' });

			const products = await OrderProduct.findAll({
				attributes: [
					[conn.col('productId'), 'id'],
					[conn.col('productRelated.name'), 'name'],
					[conn.col('productRelated.image'), 'image'],
					[conn.fn('COUNT', conn.col('productId')), 'qty']
				],
				group: ['productId'],
				order: [[conn.fn('COUNT', conn.col('productId')), 'DESC'], [conn.col('name'), 'ASC']],
				include: [{
					model: Product,
					as: 'productRelated'
				}],
				
				where,
				...getSQLPagination(pagination),
			});

			return products.map(row => row.get());
		},

		businessHours(parent) {
			return businessHoursLoader.load(parent.get('id'));
		},
		async isOpen(parent) {
			const businessHours = await businessHoursLoader.load(parent.get('id'));
			
			return companyIsOpen(businessHours);
		},

		countProducts(parent, { filter }) {
			const _filter = sanitizeFilter(filter);

			// find and count products
			return parent.countProducts({ where: _filter });
		},
		products (parent, { filter, pagination }) {
			if (parent.products) return parent.products;

			const where = sanitizeFilter(filter);

			return parent.getProducts({
				where,
				order: [['name', 'ASC']],
				...getSQLPagination(pagination),
			})
		},

		countOrders(parent, { filter }) {
			const search = ['street', 'complement', '$user.firstName$', '$user.lastName$', '$user.email$'];
			const _filter = sanitizeFilter(filter, { search, excludeFilters: ['active'], table: 'order' });

			return parent.countOrders({ where: _filter, include: [User] });
		},
		orders(parent, { filter, pagination }) {
			const search = ['street', 'complement', '$user.firstName$', '$user.lastName$', '$user.email$'];
			const _filter = sanitizeFilter(filter, { search, excludeFilters: ['active'], table: 'order' });

			return parent.getOrders({
				where: _filter,
				order: [['createdAt', 'DESC']],
				...getSQLPagination(pagination),

				include: [User]
			});
		},
		type(parent) {
			return parent.getCompanyType();
		},

		paymentMethods(parent, { filter }) {
			const where = sanitizeFilter(filter);

			return parent.getPaymentMethods({
				where,
				order: [['order', 'ASC'], ['displayName', 'ASC']]
			});
		},
		deliveryAreas(parent) {
			return parent.getDeliveryAreas();
		},

		countRatings(parent, { filter }) {
			const _filter = sanitizeFilter(filter, { excludeFilters: ['active'], search: ['comment', '$user.firstName$', '$user.email$'] });

			return parent.countRatings({
				where: _filter,
				order: [['createdAt', 'Desc']],

				include: [User]
			})
		},
		ratings(parent, { filter, pagination }) {
			const _filter = sanitizeFilter(filter, { excludeFilters: ['active'], search: ['comment', '$user.firstName$', '$user.email$'] });

			return parent.getRatings({
				where: _filter,
				order: [['createdAt', 'DESC']],
				...getSQLPagination(pagination),

				include: [User]
			})
		},
		async rankPosition(parent, { radius }) {
			const companyAddress = await parent.getAddress();
			if (!companyAddress) throw new Error('Endereço da empresa não encontrado')
			const companyPoint = fn('ST_GeomFromText', literal(`'POINT(${companyAddress.location.coordinates[0]} ${companyAddress.location.coordinates[1]})'`));
			
			const companies = await Company.findAll({
				attributes: ['id', 'name', [fn('AVG', col('ratings.rate')), 'averageRate']],
				include: [Address, Rating],
				where: where(fn('ST_Distance_Sphere', companyPoint, col('address.location')), '<', radius * 1000),
				order: [[literal('averageRate'), 'DESC']],
				group: 'company.id'
			})

			return companies.findIndex(c => parent.get('id') === c.get('id')) + 1;
		},

		countCategories(parent, { filter }) {
			const search = ['name', 'description'];
			const where = sanitizeFilter(filter, { search, table: 'order' });

			return parent.countCategories({ where });
		},
		categories(parent, { filter, pagination }) {
			const search = ['name', 'description'];
			const where = sanitizeFilter(filter, { search, table: 'order' });

			return parent.getCategories({
				where,
				include: [Product],
				...getSQLPagination(pagination),
			});
		},
		async rate(parent) {
			const companyId = parent.get('id');
			const rating = await Rating.cache(companyRateKey(companyId))
				.findOne({
					attributes: [[fn('AVG', col('rate')), 'rateAvarage']],
					where: { companyId }
				});

			/* const [rating] = await parent.getRatings({
				attributes: [[fn('AVG', col('rate')), 'rateAvarage']]
			}) */

			return rating.get('rateAvarage') || 0;
		},
		async distance(parent, { location }) {
			const companyAddress = await Address.cache().findByPk(parent.get('addressId'));

			return (calculateDistance({
				latitude: location.coordinates[0], longitude: location.coordinates[1]
			},{
				latitude: companyAddress.location.coordinates[0], longitude: companyAddress.location.coordinates[1]
			}) / 1000).toFixed(2);
		}
	}
}