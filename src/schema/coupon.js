import { gql }  from 'apollo-server';
import { Op, fn } from 'sequelize';

import { upload } from '../controller/uploads';
import Company from '../model/company';
import Coupon from '../model/coupon';
import Product from '../model/product';
import User from '../model/user';
import connection from '../services/connection';
import { sanitizeFilter, getSQLPagination } from '../utilities';
import { couponProductWhere } from '../utilities/coupon';

export const typeDefs =  gql`
	
	type Coupon {
		id: ID!
		name: String!
		image: String
		description: String
		masterOnly: Boolean!

		featured: Boolean!
		taxable: Float!
		active: Boolean!
		valueType: ValueType!
		value: Float!
		freeDelivery: Boolean!

		startsAt: DateTime!
		expiresAt: DateTime!
		createdAt: DateTime!
		updatedAt: DateTime!
		
		#rules
		minValue: Int
		maxValue: Int
		maxPerUser: Int!
		maxPurchases: Int!
		onlyFirstPurchases: Boolean!

		products: [Product]!
		companies: [Company]!
		users: [User]!
	}

	input CouponInput {
		name: String
		file: Upload
		description: String

		featured: Boolean
		taxable: Float!
		active: Boolean
		type: Type
		valueType: ValueType
		value: Float
		freeDelivery: Boolean!

		startsAt: DateTime
		expiresAt: DateTime

		#rules
		minValue: Int
		maxValue: Int
		maxPerUser: Int
		maxPurchases: Int
		onlyFirstPurchases: Boolean

		companies: [ID]
		products: [ID]
		users: [ID]
	}

	extend type Order {
		coupon: Coupon
	}

	extend input OrderInput {
		couponId: ID
	}

	extend type User {
		coupons(order: OrderInput): [Coupon]!
	}

	extend type Product {
		countCoupons(notIn: [ID]): Int!
		coupons(notIn: [ID]): [Coupon]!
	}

	extend type Query {
		countCoupons(filter: Filter): Int!
		coupons(filter: Filter, pagination: Pagination): [Coupon]!
		coupon(id: ID!): Coupon!
	}

	extend type Mutation {
		createCoupon(data: CouponInput!): Coupon!
		updateCoupon(id: ID!, data: CouponInput!): Coupon!

		checkCoupon(couponName: String!, order: OrderInput!): Coupon!
	}
`;

export const resolvers = {
	Mutation: {
		createCoupon(_, { data }, { user, company }) {
			return connection.transaction(async transaction => {
				// if needs to upload a file
				if (data.file) data.image = await upload('coupons', await data.file);

				// check if user is master, if true only user master can edit
				if (user.can('master')) data.masterOnly = true;
				else {
					// if user is not master, the coupon will be charged from company
					data.taxable = true;

					// if user is not master, the company has to be selected
					if (!data.companies.length) data.companies = [company.get('id')]
				}

				const createdCoupon = await Coupon.create(data, { transaction });

				if (data.companies) await createdCoupon.setCompanies(data.companies, { transaction });
				if (data.products) await createdCoupon.setProducts(data.products, { transaction });
				if (data.users) await createdCoupon.setUsers(data.users, { transaction });

				return createdCoupon;
			});
		},
		updateCoupon(_, { id, data }, { user, company }) {
			return connection.transaction(async transaction => {
				// check if coupon exists
				const couponFound = await Coupon.findByPk(id);
				if (!couponFound) throw new Error('Cupom não encontrado');

				// check if user can update coupon
				if (couponFound.get('masterOnly') === true && !user.can('master')) throw new Error('Você não tem permissões para alterar esse cupom');

				// if needs to upload a file
				if (data.file) data.image = await upload('cupons', await data.file);

				// check if user is master, if true only user master can edit
				if (user.can('master')) data.masterOnly = true;
				else {
					// if user is not master, the coupon will be charged from company
					data.taxable = true;

					// if user is not master, the company has to be selected
					if (!data.companies.length) data.companies = [company.get('id')]
				}

				const updatedCoupon = await couponFound.update(data, { fields: ['name', 'image', 'description', 'active', 'type', 'valueType', 'value', 'startsAt', 'expiresAt', 'masterOnly', 'maxPerUser', 'maxPurchases', 'onlyFirstPurchases', 'taxable', 'featured', 'minValue', 'maxValue', 'freeDelivery'], transaction });

				if (data.companies) await updatedCoupon.setCompanies(data.companies, { transaction });
				if (data.products) await updatedCoupon.setProducts(data.products, { transaction });
				if (data.users) await updatedCoupon.setUsers(data.users, { transaction });

				return updatedCoupon;
			});
		},
		async checkCoupon(_, { couponName, order }) {
			const coupon = await Coupon.findOne({
				order: [['startsAt', 'DESC']],
				include: [Company, Product, User],

				where: {
					name: { [Op.like]: couponName.trim() },
					active: true,
					startsAt: { [Op.lte]: fn('NOW') },
					expiresAt: { [Op.gte]: fn('NOW') }
				}
			});
			if (!coupon) throw new Error('Esse cupom não é válido');

			await coupon.isValid(order);

			return coupon;
		}
	},
	Query: {
		async coupon(_, { id }) {
			// check if coupon exists
			const couponFound = await Coupon.findByPk(id);
			if (!couponFound) throw new Error('Campanha não encontrado');

			return couponFound;
		},
		countCoupons(_, { filter }) {
			const where = sanitizeFilter(filter, { search: ['name', 'description', '$company.name$', '$user.firstName$', '$product.name$'] });

			return Coupon.findAll({
				where,
				include: [Company, User, Product]
			}).then((res)=>res.length)
		},
		coupons(_, { filter, pagination }) {
			const where = sanitizeFilter(filter, { search: ['name', 'description', '$company.name$', '$user.firstName$', '$product.name$'] });

			return Coupon.findAll({
				where,
				order: [['expiresAt', 'DESC'], ['createdAt', 'Desc']],
				include: [Company, User, Product],
				...getSQLPagination(pagination),
			})
		}
	},
	User: {
		coupons(parent, { companiesIds, productsIds }) {
			let where = {
				active: true,
				startsAt: { [Op.lte]: fn('NOW') },
				expiresAt: { [Op.gte]: fn('NOW') }
			}
			let include = [];

			if (companiesIds) {
				include = [...include, Company];

				where['$companies.id$'] = {
					[Op.or]: [
						companiesIds,
						{ [Op.is]: null }
					]
				};
			}
			if (productsIds) {
				include = [...include, Product];
				where['$products.id$'] = {
					[Op.or]: [
						productsIds,
						{ [Op.is]: null }
					]
				};
			}

			return parent.getCoupons({
				group: 'name',
				order: [['startsAt', 'DESC']],
				include,

				where
			});
		}
	},
	Coupon: {
		products(parent) {
			return parent.getProducts();
		},
		companies(parent) {
			return parent.getCompanies();
		},
		users(parent) {
			return parent.getUsers();
		},
	},
	Product: {
		countCoupons(parent, { notIn = {} }) {
			// count all realted campaigns
			return Coupon.count({
				where: {
					...couponProductWhere(parent),
					id: { [Op.notIn]: notIn }
				},
				include: [Product, Company]
			})
		},
		coupons(parent, { notIn = {} }) {
			// get all realted campaigns
			return Coupon.findAll({
				where: {
					...couponProductWhere(parent),
					id: { [Op.notIn]: notIn }
				},
				include: [Product, Company]
			})
		},
	},
	Order: {
		coupon(parent) {
			return parent.getCoupon();
		}
	}
}