import { makeExecutableSchema, gql }  from 'apollo-server';
import { merge }  from 'lodash';

import { typeDefs as Address, resolvers as addressResolvers }  from './address';
import { typeDefs as BusinessHour, resolvers as businessHourResolvers }  from './business_hour';
import { typeDefs as Campaign, resolvers as campaignResolvers }  from './campaign';
import { typeDefs as Category, resolvers as categoryResolvers }  from './category';
import { typeDefs as Company, resolvers as companyResolvers }  from './company';
import { typeDefs as CompanyType, resolvers as companyTypeResolvers }  from './company-type';
import * as customTypes from './customTypes';
import { typeDefs as DeliveryArea, resolvers as deliveryAreaResolvers }  from './delivery_area';
import directives  from './directives';
import { typeDefs as Emails, resolvers as emailsResolvers }  from './emails';
import { typeDefs as Meta, resolvers as metaResolvers }  from './meta';
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
import { typeDefs as User, resolvers as userResolvers }  from './user';

const typeDefs = gql`
	directive @isAuthenticated on FIELD | FIELD_DEFINITION
	directive @hasRole(permission: String!, checkSameUser: Boolean, variableKey: String) on FIELD | FIELD_DEFINITION

	scalar Upload
	scalar DateTime
	scalar GeoPoint

	input Filter {
		showInactive: Boolean
		status: String
		createdAt: String
		search: String
	}

	input Pagination {
		page: Int!
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
		countCompanies(filter: Filter): Int! @hasRole(permission: "master")
		companies(filter: Filter, pagination: Pagination): [Company]! @hasRole(permission: "master")
	}

	type Mutation {
		uploadFile(file: Upload!): String! @hasRole(permission: "master")
	}
`

const resolvers = {
	Mutation: {
		
	},
	...customTypes
}

export default makeExecutableSchema({
	typeDefs: [typeDefs, Address, CompanyType, BusinessHour, Rating, Emails, Campaign, Category, Company, Option, OptionsGroup, OrderOptions, OrderOptionsGroup, OrderProduct, Order, PaymentMethod, Product, Role, DeliveryArea, User, Phone, Meta],
	resolvers: merge(resolvers, addressResolvers, companyTypeResolvers, businessHourResolvers, ratingResolvers, emailsResolvers, campaignResolvers, categoryResolvers, companyResolvers, optionResolvers, optionsGroupResolvers, orderOptionResolvers, orderOptionsGroupResolvers, orderProductResolvers, orderResolvers, paymentMethodResolvers, productResolvers, roleResolvers, deliveryAreaResolvers, userResolvers, phoneResolvers, metaResolvers),
	directiveResolvers: directives,
})