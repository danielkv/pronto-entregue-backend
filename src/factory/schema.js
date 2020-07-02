import { makeExecutableSchema, gql }  from 'apollo-server';
import { merge }  from 'lodash';

import { typeDefs as Address, resolvers as addressResolvers }  from '../schema/address';
import { typeDefs as BusinessHour, resolvers as businessHourResolvers }  from '../schema/business_hour';
import { typeDefs as Category, resolvers as categoryResolvers }  from '../schema/category';
import { typeDefs as Company, resolvers as companyResolvers }  from '../schema/company';
import { typeDefs as CompanyPlan, resolvers as companyPlanResolvers }  from '../schema/company-plan';
import { typeDefs as CompanyType, resolvers as companyTypeResolvers }  from '../schema/company-type';
import { typeDefs as Coupon, resolvers as couponResolvers }  from '../schema/coupon';
import { typeDefs as CreditHistory, resolvers as creditHistoryResolvers }  from '../schema/credit_history';
import * as customTypes from '../schema/customTypes';
import { typeDefs as Delivery, resolvers as deliveryResolvers }  from '../schema/delivery';
import { typeDefs as DeliveryArea, resolvers as deliveryAreaResolvers }  from '../schema/delivery_area';
import directives  from '../schema/directives';
import { typeDefs as Emails, resolvers as emailsResolvers }  from '../schema/emails';
import { typeDefs as Meta, resolvers as metaResolvers }  from '../schema/meta';
import { typeDefs as Notification, resolvers as NotificationResolvers }  from '../schema/notification';
import { typeDefs as Option, resolvers as optionResolvers }  from '../schema/option';
import { typeDefs as OptionsGroup, resolvers as optionsGroupResolvers }  from '../schema/options_group';
import { typeDefs as Order, resolvers as orderResolvers }  from '../schema/order';
import { typeDefs as OrderOptions, resolvers as orderOptionResolvers }  from '../schema/order_option';
import { typeDefs as OrderOptionsGroup, resolvers as orderOptionsGroupResolvers }  from '../schema/order_options_group';
import { typeDefs as OrderProduct, resolvers as orderProductResolvers }  from '../schema/order_product';
import { typeDefs as PaymentMethod, resolvers as paymentMethodResolvers }  from '../schema/payment_method';
import { typeDefs as PeDeliveryArea, resolvers as peDeliveryAreaResolvers }  from '../schema/pe_delivery_area';
import { typeDefs as Phone, resolvers as phoneResolvers }  from '../schema/phone';
import { typeDefs as Product, resolvers as productResolvers }  from '../schema/product';
import { typeDefs as Rating, resolvers as ratingResolvers }  from '../schema/rating';
import { typeDefs as Report, resolvers as reportResolvers }  from '../schema/report';
import { typeDefs as Role, resolvers as roleResolvers }  from '../schema/role';
import { typeDefs as Sale, resolvers as saleResolvers }  from '../schema/sale';
import { typeDefs as GoogleSocialLogin, resolvers as googleResolvers }  from '../schema/social_login';
import { typeDefs as Sounds, resolvers as soundResolvers }  from '../schema/sounds';
import { typeDefs as User, resolvers as userResolvers }  from '../schema/user';
import { typeDefs as ViewArea, resolvers as viewAreaResolvers }  from '../schema/view_area';

const typeDefs = gql`
	directive @isAuthenticated on FIELD | FIELD_DEFINITION
	directive @hasRole(permission: String!, checkSameUser: Boolean, variableKey: String) on FIELD | FIELD_DEFINITION

	scalar Upload
	scalar DateTime
	scalar GeoPoint
	scalar JSONObject
	scalar JSON

	input Filter {
		showInactive: Boolean
		status: String
		createdAt: String
		search: String
		type: String
		statusNotIn: [String]

		companyId: ID
	}

	input Pagination {
		page: Int
		rowsPerPage: Int!
	}
	
	type PageInfo {
		page: Int
		rowsPerPage: Int!
	}

	enum Type {
		discount
		cashback
		value
	}

	enum ValueType {
		value
		percentage
	}

	type Query {
		pageInfo: PageInfo
	}

	type Mutation {
		uploadFile(file: Upload!): String! @hasRole(permission: "master")
	}
`

const resolvers = {
	Query: {
		pageInfo(_, __, ___, info) {
			let result;
			try {
				result = info.variableValues.pagination;
			} catch(err) {
				result = 0
			}
			return result || {};
		},
	},
	Mutation: {
		
	},
	...customTypes
}



export default new class GraphQlSchemaFactory {
	create() {
		const schema = makeExecutableSchema({
			typeDefs: [typeDefs, Delivery, Sounds, PeDeliveryArea, Report, CompanyPlan, ViewArea, Notification, Address, Sale, CreditHistory, CompanyType, BusinessHour, Rating, Emails, Coupon, Category, Company, Option, OptionsGroup, OrderOptions, OrderOptionsGroup, OrderProduct, Order, PaymentMethod, Product, Role, DeliveryArea, User, Phone, Meta, GoogleSocialLogin],
			resolvers: merge(resolvers, deliveryResolvers, soundResolvers, peDeliveryAreaResolvers, reportResolvers, companyPlanResolvers, viewAreaResolvers, NotificationResolvers, saleResolvers, addressResolvers, creditHistoryResolvers ,companyTypeResolvers, businessHourResolvers, ratingResolvers, emailsResolvers, couponResolvers, categoryResolvers, companyResolvers, optionResolvers, optionsGroupResolvers, orderOptionResolvers, orderOptionsGroupResolvers, orderProductResolvers, orderResolvers, paymentMethodResolvers, productResolvers, roleResolvers, deliveryAreaResolvers, userResolvers, phoneResolvers, metaResolvers, googleResolvers),
			directiveResolvers: directives,
		})

		console.log(' - GraphQl schema created');

		return schema;
	}
}