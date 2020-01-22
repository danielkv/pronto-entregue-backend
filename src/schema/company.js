import { gql }  from 'apollo-server';

import Company  from '../model/company';
import CompanyMeta  from '../model/companyMeta';
import OrderProduct from '../model/orderProduct';
import Product from '../model/product';
import User from '../model/user';
import conn  from '../services/connection';
import { getSQLPagination, sanitizeFilter }  from '../utilities';
import { defaultBusinessHours } from '../utilities/company';

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

		countUsers(filter: Filter): Int! @hasRole(permission: "users_read", scope: "adm")
		users(filter: Filter, pagination: Pagination): [User]! @hasRole(permission: "users_read", scope: "adm")

		deliveryTime: Int! #minutes
		customization: CompanyCustomization!

		deliveryAreas: [DeliveryArea]!
		paymentMethods: [PaymentMethod]!

		bestSellers(filter:Filter, pagination: Pagination): [ProductBestSeller]!

		businessHours: [BusinessHour]!

		countOrders(filter:Filter): Int!
		orders(filter:Filter, pagination: Pagination): [Order]!

		countProducts(filter:Filter): Int!
		products(filter:Filter, pagination: Pagination): [Product]!
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
		active: Boolean
		metas: [MetaInput]
	}

	type CompanyCustomization {
		color: String!
		background: String!
		logo: String!
	}

	extend type Mutation {
		createCompany(data: CompanyInput!): Company! @hasRole(permission: "company_edit", scope: "adm")
		updateCompany(id: ID!, data: CompanyInput!): Company! @hasRole(permission: "company_edit", scope: "adm")
	}

	extend type Query {
		company(id: ID!): Company!
		userCompany: [Company!] @hasRole(permission: "company_read", scope: "adm")
	}
`;

export const resolvers =  {
	Mutation: {
		createCompany: (_, { data }) => {
			return conn.transaction(transaction => {
				return Company.create(data, { include: [CompanyMeta], transaction })
			})
		},
		updateCompany: (_, { id, data }) => {
			return conn.transaction(transaction => {
				return Company.findByPk(id)
					.then(company=>{
						if (!company) throw new Error('Empresa não encontrada');

						return company.update(data, { fields: ['name', 'displayName', 'active'], transaction })
					})
					.then(async (companyUpdated) => {
						if (data.metas) {
							await CompanyMeta.updateAll(data.metas, companyUpdated, transaction);
						}
						return companyUpdated;
					})
			})
		}
	},
	Query: {
		companies: () => {
			return Company.findAll();
		},
		userCompany: (_, __, { user }) => {
			if (user.can('master'))
				return Company.findAll();

			return user.getCompany({ through: { where: { active: true } } });
		},
		async company(_, { id }) {
			// check if company exists
			const company = await Company.findByPk(id);
			if (!company) throw new Error('Empresa não encontrada');

			return company;
		},
	},
	Company: {
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

		paymentMethods(parent) {
			return parent.getPaymentMethods();
		},
		deliveryAreas(parent) {
			return parent.getDeliveryAreas();
		},
	}
}