import { gql }  from 'apollo-server';

import NotificationController from '../controller/notification';

export const typeDefs =  gql`
	extend type Mutation {
		pushNotificationToken(userId: ID!, token: String!, type: String): Boolean!
		removeNotificationToken(token: String!, type: String): Boolean!
	}
`;

export const resolvers =  {
	Mutation: {
		pushNotificationToken(_, { userId, token, type='device' }) {
			return NotificationController.addToken(userId, token, type)
		},
		removeNotificationToken(_, { token, type='device' }) {
			return NotificationController.removeToken(token, type);
		}
	}
}