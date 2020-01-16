import { gql }  from 'apollo-server';

import { sendMail } from '../controller/mailer';

export const typeDefs = gql`
	input StoreSuggestion {
		name: String!
		email: String!
		phone: String!
		address: AddressInput!
	}

	extend type Mutation {
		suggestStore(store: StoreSuggestion): Boolean!
	}
`;

export const resolvers = {
	Mutation: {
		suggestStore(_, { store }, { user }) {
			const emailContext = {
				user: user.get(),
				store,
			}

			// send an email to admin
			sendMail('suggest-store/admin', { ...emailContext, to: process.env.EMAIL_ACCOUNT });

			// send a thanks email to user
			sendMail('suggest-store/user', { ...emailContext, to: user.get('email') });

			return true;
		},
	}
}