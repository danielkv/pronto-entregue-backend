import { gql }  from 'apollo-server';

import { MAIL_MESSAGE } from '../jobs/keys';
import queue from '../services/queue';

export const typeDefs = gql`
	extend type Mutation {
		suggestCompany(data: JSON): Boolean!
	}
`;

export const resolvers = {
	Mutation: {
		suggestCompany(_, { data }) {
			
			// add email job to admin
			queue.add(MAIL_MESSAGE, {
				template: 'suggest-store/admin',
				data: { to: 'indicacoes@prontoentregue.com.br' },
				context: data
			})

			// add email job to user
			queue.add(MAIL_MESSAGE, {
				template: 'suggest-store/user',
				data: { to: data.email },
				context: data
			})
			
			return true;
		},
	}
}