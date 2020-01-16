import { gql }  from 'apollo-server';

import Coupon  from '../model/category';
import { sanitizeFilter, getSQLPagination } from '../utilities';

export const typeDefs =  gql`
	
	type Coupon {
		id: ID!
		code: String!
		description: String
		active: Boolean!
		type: Type!
		valueType: ValueType!
		value: Float!
		expiresAt: DateTime!
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	input CouponInput {
		code: String
		description: String
		active: Boolean
		type: Type
		valueType: ValueType
		value: Float
		expiresAt: Int
	}

	extend type Query {
		coupons(filter: Filter, pagination: Pagination): [Coupon]!
		coupon(id: ID!): Coupon!
	}

	extend type Mutation {
		createCoupon(data: CouponInput!): Coupon!
		updateCoupon(id: ID!, data: CouponInput!): Coupon!
	}
`;

export const resolvers = {
	Mutation: {
		createCoupon(_, { data }) {
			return Coupon.create(data);
		},
		async updateCoupon(_, { id, data }) {
			// check if coupon exists
			const couponFound = await Coupon.findByPk(id);
			if (!couponFound) throw new Error('Cupom não encontrado');

			return couponFound.update(data, { fields: ['code', 'description', 'active', 'type', 'valueType', 'value', 'expiresAt'] });
		}
	},
	Query: {
		async coupon(_, { id }) {
			// check if coupon exists
			const couponFound = await Coupon.findByPk(id);
			if (!couponFound) throw new Error('Cupom não encontrado');

			return couponFound;
		},
		coupons(_, { filter, pagination }) {
			const _filter = sanitizeFilter(filter, { search: ['code', 'description'] });

			return Coupon.findAll({
				where: _filter,
				order: [['expiresAt', 'DESC'], ['createdAt', 'DESC']],
				...getSQLPagination(pagination),
			})
		}
	},
	Coupon: {
		
	}
}