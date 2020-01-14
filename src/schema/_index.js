import { makeExecutableSchema, gql }  from 'apollo-server';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { merge }  from 'lodash';

import { upload }  from '../controller/uploads';
import { typeDefs as Address, resolvers as addressResolvers }  from './address';
import { typeDefs as Branch, resolvers as branchResolvers }  from './branch';
import { typeDefs as Category, resolvers as categoryResolvers }  from './category';
import { typeDefs as Company, resolvers as companyResolvers }  from './company';
import { typeDefs as DeliveryArea, resolvers as deliveryAreaResolvers }  from './delivery_area';
import directives  from './directives';
import { typeDefs as Meta, resolvers as metaResolvers }  from './meta';
import { typeDefs as Option, resolvers as optionResolvers }  from './option';
import { typeDefs as OptionsGroup, resolvers as optionsGroupResolvers }  from './options_group';
import { typeDefs as Order, resolvers as orderResolvers }  from './order';
import { typeDefs as OrderOption, resolvers as orderOptionResolvers }  from './order_option';
import { typeDefs as OrderOptionsGroup, resolvers as orderOptionsGroupResolvers }  from './order_options_group';
import { typeDefs as OrderProduct, resolvers as orderProductResolvers }  from './order_product';
import { typeDefs as PaymentMethod, resolvers as paymentMethodResolvers }  from './payment_method';
import { typeDefs as Phone, resolvers as phoneResolvers }  from './phone';
import { typeDefs as Product, resolvers as productResolvers }  from './product';
import { typeDefs as Role, resolvers as roleResolvers }  from './role';
import { typeDefs as User, resolvers as userResolvers }  from './user';

const typeDefs = gql`
directive @isAuthenticated on FIELD | FIELD_DEFINITION
directive @hasRole(permission: String!, scope: String = "master") on FIELD | FIELD_DEFINITION

scalar Upload
scalar DateTime

input Filter {
	showInactive: Boolean
	status: String
	createdAt: DateTime!
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
	companies: [Company]!
	roles: [Role]! @hasRole(permission: "roles_edit", scope: "adm")
	users: [User]! @hasRole(permission: "master")
}

type Mutation {
	uploadFile(file: Upload!): String! @hasRole(permission: "master")
}
`

const resolvers = {
	Mutation: {
		uploadFile: async (_, { file }) => {
			return await upload('testea', await file);
		}
	},
	DateTime: new GraphQLScalarType({
		name: 'Date',
		description: 'Date custom scalar type',
		parseValue(value) {
			return new Date(value); // value from the client
		},
		serialize(value) {
			return value.getTime(); // value sent to the client
		},
		parseLiteral(ast) {
			if (ast.kind === Kind.INT) {
				return parseInt(ast.value, 10); // ast value is always in string format
			}
			return null;
		},
	})
}

export default makeExecutableSchema({
	typeDefs: [typeDefs, Branch, Category, Company, Option, OptionsGroup, OrderOption, OrderOptionsGroup, OrderProduct, Order, PaymentMethod, Product, Role, DeliveryArea, User, Address, Phone, Meta],
	resolvers: merge(resolvers, branchResolvers, categoryResolvers, companyResolvers, optionResolvers, optionsGroupResolvers, orderOptionResolvers, orderOptionsGroupResolvers, orderProductResolvers, orderResolvers, paymentMethodResolvers, productResolvers, roleResolvers, deliveryAreaResolvers, userResolvers, addressResolvers, phoneResolvers, metaResolvers),
	directiveResolvers: directives,
})