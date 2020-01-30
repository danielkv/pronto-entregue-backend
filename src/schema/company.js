import { gql }  from 'apollo-server';
import { Op } from 'sequelize';

import Company  from '../model/company';
import CompanyMeta  from '../model/companyMeta';
import OrderProduct from '../model/orderProduct';
import Product from '../model/product';
import User from '../model/user';
import conn  from '../services/connection';
import { getSQLPagination, sanitizeFilter }  from '../utilities';
import { defaultBusinessHours } from '../utilities/company';
import Address from '../model/address';

export const typeDefs =  gql`

	type Company {
		id: ID!
		name: String!
		displayName: String!
		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!
		metas: [Meta]!
		lastMonthRevenue: Float!
		userRelation: CompanyRelation!

		address: Address

		type: CompanyType!

		countUsers(filter: Filter): Int! @hasRole(permission: "users_read")
		users(filter: Filter, pagination: Pagination): [User]! @hasRole(permission: "users_read")

		deliveryTime: Int! #minutes
		customization: CompanyCustomization!

		deliveryAreas: [DeliveryArea]!
		paymentMethods: [PaymentMethod]!

		bestSellers(filter:Filter, pagination: Pagination): [ProductBestSeller]!

		businessHours: [BusinessHour]!

		countOrders(filter:Filter): Int!
		orders(filter:Filter, pagination: Pagination): [Order]!

		countProducts(filter:Filter): Int!
		products(filter:Filter, pagination: Pagination): [Product]! @hasRole(permission: "products_read")

		countRatings(filter:Filter): Int! @hasRole(permission: "adm")
		ratings(filter:Filter, pagination: Pagination): [Rating]! @hasRole(permission: "adm")
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
		companyTypeId: ID
		active: Boolean
		metas: [MetaInput]
		address: AddressInput
	}

	type CompanyCustomization {
		color: String!
		background: String!
		logo: String!
	}

	extend type Mutation {
		searchCompanies(search: String!, exclude: [ID]): [Company]!
		createCompany(data: CompanyInput!): Company! @hasRole(permission: "companies_edit")
		updateCompany(id: ID!, data: CompanyInput!): Company! @hasRole(permission: "companies_edit")
	}

	extend type Query {
		company(id: ID!): Company!
	}
`;

export const resolvers =  {
	Mutation: {
		searchCompanies(_, { search, exclude = [] }) {
			const where = sanitizeFilter({ search }, { search: ['name', 'displayName'] });

			return Company.findAll({ where: { ...where, active: true, id: { [Op.notIn]: exclude } } });
		},
		createCompany(_, { data }) {
			return Company.create(data, { include: [CompanyMeta, Address] })
		},
		updateCompany(_, { id, data }) {
			return conn.transaction(async transaction => {
				// check if company exists
				const companyFound = await Company.findByPk(id)
				if (!companyFound) throw new Error('Empresa não encontrada');

				// update company address
				const address = await companyFound.getAddress();
				address.update(data.address);

				// update company
				const updatedCompany = await companyFound.update(data, { fields: ['name', 'displayName', 'active', 'companyTypeId'], transaction })
			
				// check if there are metas to update
				if (data.metas) await CompanyMeta.updateAll(data.metas, updatedCompany, transaction);
				
				return updatedCompany;
			})
		}
	},
	Query: {
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
			const company = await Company.findByPk(id);
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
		metas: (parent) => {
			return parent.getMetas();
		},
		lastMonthRevenue: () => {
			return 0;
		},
		async deliveryTime(parent) {
			// check if metadata exists
			const [meta] = await parent.getMetas({ where: { key: 'deliveryTime' } });
			if (!meta) return 0;

			return parseInt(meta.value);
		},
		async customization(parent) {
			const metas = await parent.getMetas({ where: { key: ['color', 'background', 'logo'] } });

			return {
				color: metas['color'] ? metas['color'].value : '',
				background: metas['background'] ? metas['background'].value : '',
				logo: metas['logo'] ? metas['logo'].value : '',
			}
		},

		async bestSellers(_, { filter, pagination }) {
			const _filter = sanitizeFilter(filter, { excludeFilters: ['active'], table: 'orderproduct' });

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
				
				where: _filter,
				...getSQLPagination(pagination),
			});

			return products.map(row => row.get());
		},

		async businessHours(parent) {
			// check if meta exists
			const [meta] = await parent.getMetas({ where: { key: 'businessHours' } })
			if (!meta) return defaultBusinessHours();
		
			return JSON.parse(meta.value);
		},

		countProducts(parent, { filter }) {
			const _filter = sanitizeFilter(filter);

			// find and count products
			return parent.countProducts({ where: _filter });
		},
		products: (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter);

			return parent.getProducts({
				where: _filter,
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

		paymentMethods(parent) {
			return parent.getPaymentMethods();
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
				order: [['createdAt', 'Desc']],
				...getSQLPagination(pagination),

				include: [User]
			})
		}
	}
}