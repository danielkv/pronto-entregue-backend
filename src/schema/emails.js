import { gql }  from 'apollo-server';

import JobQueue from '../factory/queue';

export const typeDefs = gql`
	extend type Mutation {
		suggestCompany(data: JSON): Boolean!
	}
`;

export const resolvers = {
	Mutation: {
		suggestCompany(_, { data }) {
			
			// add email job to admin
			JobQueue.mails.add('mail', {
				template: 'suggest-store/admin',
				data: { to: 'indicacoes@prontoentregue.com.br' },
				context: data
			})

			// add email job to user
			JobQueue.mails.add('mail', {
				template: 'suggest-store/user',
				data: { to: data.email },
				context: data
			})
			
			return true;
		},
	}
}