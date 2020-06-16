import { gql }  from 'apollo-server';

import JobQueue from '../factory/queue';
import { MAIL_MESSAGE } from '../jobs/keys';

export const typeDefs = gql`
	extend type Mutation {
		suggestCompany(data: JSON): Boolean!
	}
`;

export const resolvers = {
	Mutation: {
		suggestCompany(_, { data }) {
			
			// add email job to admin
			JobQueue.add(MAIL_MESSAGE, MAIL_MESSAGE, {
				template: 'suggest-store/admin',
				data: { to: 'indicacoes@prontoentregue.com.br' },
				context: data
			})

			// add email job to user
			JobQueue.add(MAIL_MESSAGE, MAIL_MESSAGE, {
				template: 'suggest-store/user',
				data: { to: data.email },
				context: data
			})
			
			return true;
		},
	}
}