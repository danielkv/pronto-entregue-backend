import { gql }  from 'apollo-server';

import PaymentMethod  from '../model/paymentMethod';

export const typeDefs =  gql`
	type PaymentMethod {
		id: ID!
		image: String!
		type: String!
		active: Boolean!
		displayName: String!
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	extend type Query {
		paymentMethods(type: String!): [PaymentMethod]! @hasRole(permission: "payment_methods_read")
	}

	extend type Mutation {
		enablePaymentMethod(id: ID!): PaymentMethod! @hasRole(permission:"payment_methods_edit")
		disablePaymentMethod(id: ID!): PaymentMethod! @hasRole(permission:"payment_methods_edit")
	}
`;

export const resolvers =  {
	Query: {
		paymentMethods: (_, { type }) => {
			return PaymentMethod.findAll({ where: { type } });
		}
	},
	Mutation: {
		async enablePaymentMethod(_, { id }, { company }) {
			// check if payment method exists
			const paymentMethod = await PaymentMethod.findByPk(id);
			if (!paymentMethod) throw new Error('Método de pagamento não encontrado');

			// enable payment method to company
			await company.addPaymentMethod(paymentMethod);
				
			return paymentMethod;
		},
		async disablePaymentMethod(_, { id }, { company }) {
			// check if payment method exists
			const paymentMethod = await PaymentMethod.findByPk(id);
			if (!paymentMethod) throw new Error('Método de pagamento não encontrado');

			// enable payment method to company
			await company.removePaymentMethod(paymentMethod.get('id'));
				
			return paymentMethod;
		},
	}
}