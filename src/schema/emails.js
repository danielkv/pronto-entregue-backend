import { gql }  from 'apollo-server';

import notifications from '../notifications';

export const typeDefs = gql`
	extend type Mutation {
		suggestCompany(data: JSON): Boolean!
	}
`;

export const resolvers = {
	Mutation: {
		suggestCompany(_, { data }) {
			
			// send an email to admin
			notifications.send('suggest-store/admin', { to: 'indicacoes@prontoentregue.com.br' }, data);
			
			// send a thanks email to user
			notifications.send('suggest-store/user', { to: data.email }, data);

			return true;
		},
	}
}