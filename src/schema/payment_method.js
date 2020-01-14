import { gql }  from 'apollo-server';

import PaymentMethod  from '../model/paymentMethod';

export const typeDefs =  gql`
	type PaymentMethod {
		id: ID!
		name: String!
		displayName: String!
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	extend type Query {
		paymentMethods: [PaymentMethod]! @hasRole(permission: "payment_methods_read", scope: "adm")
	}
`;

export const resolvers =  {
	Query: {
		paymentMethods: () => {
			return PaymentMethod.findAll();
		}
	}
}