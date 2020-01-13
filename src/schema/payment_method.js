import { gql }  from 'apollo-server';

import PaymentMethods  from '../model/payment_methods';

export const typeDefs =  gql`
	type PaymentMethod {
		id:ID!
		name:String!
		display_name:String!
		createdAt:String!
		updatedAt:String!
	}

	extend type Query {
		paymentMethods:[PaymentMethod]! @hasRole(permission:"payment_methods_read", scope:"adm")
	}
`;

export const resolvers =  {
	Query: {
		paymentMethods: () => {
			return PaymentMethods.findAll();
		}
	}
}