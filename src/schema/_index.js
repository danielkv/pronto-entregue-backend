const {makeExecutableSchema, gql} = require('apollo-server');
const {merge} = require('lodash');
const directives = require('./directives');
const { upload } = require('../config/uploads');

//types
const {typeDefs: Branch, resolvers: branchResolvers} = require('./branch');
const {typeDefs: Category, resolvers: categoryResolvers} = require('./category');
const {typeDefs: Company, resolvers: companyResolvers} = require('./company');
const {typeDefs: Item, resolvers: itemResolvers} = require('./item');
const {typeDefs: Option, resolvers: optionResolvers} = require('./option');
const {typeDefs: OptionsGroup, resolvers: optionsGroupResolvers} = require('./options_group');
const {typeDefs: OrderOption, resolvers: orderOptionResolvers} = require('./order_option');
const {typeDefs: OrderOptionsGroup, resolvers: orderOptionsGroupResolvers} = require('./order_options_group');
const {typeDefs: OrderProduct, resolvers: orderProductResolvers} = require('./order_product');
const {typeDefs: Order, resolvers: orderResolvers} = require('./order');
const {typeDefs: PaymentMethod, resolvers: paymentMethodResolvers} = require('./payment_method');
const {typeDefs: Product, resolvers: productResolvers} = require('./product');
const {typeDefs: Role, resolvers: roleResolvers} = require('./role');
const {typeDefs: DeliveryArea, resolvers: deliveryAreaResolvers} = require('./delivery_area');
const {typeDefs: User, resolvers: userResolvers} = require('./user');

const {typeDefs: Address, resolvers: addressResolvers} = require('./address');
const {typeDefs: Phone, resolvers: phoneResolvers} = require('./phone');

const typeDefs = gql`
	directive @isAuthenticated on FIELD | FIELD_DEFINITION
	directive @hasRole(permission: String!, scope: String = "master") on FIELD | FIELD_DEFINITION
	directive @dateTime on FIELD | FIELD_DEFINITION

	scalar Upload

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

	type File {
		filename: String!
		mimetype: String!
		encoding: String!
	}

	type Query {
		companies:[Company]!
		roles:[Role]! @hasRole(permission:"roles_edit", scope:"adm")
		users:[User]! @hasRole(permission:"master")
	}

	type Mutation {
		uploadFile(file: Upload!): String! @hasRole(permission:"master")
	}
`

const resolvers = {
	Mutation: {
		uploadFile: async (_, { file }) => {
			return await upload('testea', await file);
		}
	}
}

module.exports = makeExecutableSchema({
	typeDefs : [typeDefs, Branch, Category, Company, Item, Option, OptionsGroup, OrderOption, OrderOptionsGroup, OrderProduct, Order, PaymentMethod, Product, Role, DeliveryArea, User, Address, Phone],
	resolvers : merge(resolvers, branchResolvers, categoryResolvers, companyResolvers, itemResolvers, optionResolvers, optionsGroupResolvers, orderOptionResolvers, orderOptionsGroupResolvers, orderProductResolvers, orderResolvers, paymentMethodResolvers, productResolvers, roleResolvers, deliveryAreaResolvers, userResolvers, addressResolvers, phoneResolvers),
	directiveResolvers : directives,
})