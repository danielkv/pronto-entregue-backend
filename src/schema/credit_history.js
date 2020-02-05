import { gql }  from 'apollo-server';

import CreditHistory from '../model/creditHistory';

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
		createCreditHistory(userId: ID!, data: CreditHistoryInput!): CreditHistory!
	}

`;

export const resolvers =  {
	Mutation: {
		createCreditHistory(_, { userId, data }) {
			return CreditHistory.create({
				...data,
				userId
			})
		}
	}
}