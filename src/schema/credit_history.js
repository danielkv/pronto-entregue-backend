import { gql }  from 'apollo-server';

import CreditHistory from '../model/creditHistory';
import User from '../model/user';

export const typeDefs = gql`

	type CreditHistory {
		id: ID!
		value: Float!
		history: String!
		createdAt: DateTime!
		updatedAt: DateTime!
	}

	input CreditHistoryInput {
		id: ID
		value: Float
		history: String
	}

	extend type Mutation {
		createCreditHistory(userId: ID!, data: CreditHistoryInput!): CreditHistory! @hasRole(permission: "master")
	}

`;

export const resolvers =  {
	Mutation: {
		async createCreditHistory(_, { userId, data }) {
			// check if user exists
			const user = await User.findByPk(userId);
			if (!user) throw new Error('Usuário não encotrado');

			// check user's balance
			const balance = await user.getCreditBalance();
			if (balance.value + data.value < 0) throw new Error('Usuário não tem saldo suficiente para essa transação');

			return await CreditHistory.create({
				...data,
				userId
			})
		}
	}
}