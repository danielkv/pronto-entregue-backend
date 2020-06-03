import { gql }  from 'apollo-server';

import { balanceLoader, creditHistoryLoader } from '../loaders';
import CreditHistory from '../model/creditHistory';
import User from '../model/user';
import { sanitizeFilter, getSQLPagination } from '../utilities';

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

	extend type User {
		creditBalance: Float!
		countCreditHistory(filter: JSON): Int!
		creditHistory(filter: JSON, pagination: Pagination): [CreditHistory]!
	}

	extend type Order {
		creditHistory: CreditHistory
	}

	extend type Mutation {
		createCreditHistory(userId: ID!, data: CreditHistoryInput!): CreditHistory! @hasRole(permission: "master")
	}

`;

export const resolvers = {
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
	},
	Order: {
		creditHistory(parent) {
			const orderId = parent.get('id');

			return creditHistoryLoader.load(orderId);
		}
	},
	User: {
		async creditBalance(parent) {
			const balance = await balanceLoader.load(parent.get('id'));

			return balance.get('value');
		},
		countCreditHistory(parent, { filter }) {
			const where = sanitizeFilter(filter, { excludeFilters: ['active'], search: ['history'] });

			return parent.countCreditHistory({ where });
		},
		creditHistory(parent, { filter, pagination }) {
			const where = sanitizeFilter(filter, { excludeFilters: ['active'], search: ['history'] });

			return parent.getCreditHistory({
				where,
				...getSQLPagination(pagination),
				order: [['createdAt', 'DESC']]
			});
		}
	}
}