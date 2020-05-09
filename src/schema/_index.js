import { makeExecutableSchema, gql }  from 'apollo-server';
import { merge }  from 'lodash';

import { typeDefs as Address, resolvers as addressResolvers }  from './address';
import { typeDefs as BusinessHour, resolvers as businessHourResolvers }  from './business_hour';
import { typeDefs as Campaign, resolvers as campaignResolvers }  from './campaign';
import { typeDefs as Category, resolvers as categoryResolvers }  from './category';
import { typeDefs as Company, resolvers as companyResolvers }  from './company';
import { typeDefs as CompanyType, resolvers as companyTypeResolvers }  from './company-type';
import { typeDefs as CreditHistory, resolvers as creditHistoryResolvers }  from './credit_history';
import * as customTypes from './customTypes';
import { typeDefs as DeliveryArea, resolvers as deliveryAreaResolvers }  from './delivery_area';
import directives  from './directives';
import { typeDefs as Emails, resolvers as emailsResolvers }  from './emails';
import { typeDefs as Meta, resolvers as metaResolvers }  from './meta';
import { typeDefs as Notification, resolvers as NotificationResolvers }  from './notification';
import { typeDefs as Option, resolvers as optionResolvers }  from './option';
import { typeDefs as OptionsGroup, resolvers as optionsGroupResolvers }  from './options_group';
import { typeDefs as Order, resolvers as orderResolvers }  from './order';
import { typeDefs as OrderOptions, resolvers as orderOptionResolvers }  from './order_option';
import { typeDefs as OrderOptionsGroup, resolvers as orderOptionsGroupResolvers }  from './order_options_group';
import { typeDefs as OrderProduct, resolvers as orderProductResolvers }  from './order_product';
import { typeDefs as PaymentMethod, resolvers as paymentMethodResolvers }  from './payment_method';
import { typeDefs as Phone, resolvers as phoneResolvers }  from './phone';
import { typeDefs as Product, resolvers as productResolvers }  from './product';
import { typeDefs as Rating, resolvers as ratingResolvers }  from './rating';
import { typeDefs as Role, resolvers as roleResolvers }  from './role';
import { typeDefs as Sale, resolvers as saleResolvers }  from './sale';
import { typeDefs as GoogleSocialLogin, resolvers as googleResolvers }  from './social_login';
import { typeDefs as User, resolvers as userResolvers }  from './user';

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
			try {
				return info.variableValues.pagination;
			} catch(err) {
				return 0;
			}
		},
	},
	Mutation: {
		
	},
	...customTypes
}

export default makeExecutableSchema({
	typeDefs: [typeDefs, Notification, Address, Sale, CreditHistory, CompanyType, BusinessHour, Rating, Emails, Campaign, Category, Company, Option, OptionsGroup, OrderOptions, OrderOptionsGroup, OrderProduct, Order, PaymentMethod, Product, Role, DeliveryArea, User, Phone, Meta, GoogleSocialLogin],
	resolvers: merge(resolvers, NotificationResolvers, saleResolvers, addressResolvers, creditHistoryResolvers ,companyTypeResolvers, businessHourResolvers, ratingResolvers, emailsResolvers, campaignResolvers, categoryResolvers, companyResolvers, optionResolvers, optionsGroupResolvers, orderOptionResolvers, orderOptionsGroupResolvers, orderProductResolvers, orderResolvers, paymentMethodResolvers, productResolvers, roleResolvers, deliveryAreaResolvers, userResolvers, phoneResolvers, metaResolvers, googleResolvers),
	directiveResolvers: directives,
})