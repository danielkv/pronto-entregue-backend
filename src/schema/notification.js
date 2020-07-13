import { gql }  from 'apollo-server';

import NotificationController from '../controller/notification';
import UserController from '../controller/user';
import JobQueue from '../factory/queue';
import { sanitizeFilter } from '../utilities';
import { DEVICE_TOKEN_META, DESKTOP_TOKEN_META } from '../utilities/notifications';

export const typeDefs =  gql`
	type UsersTokens {
		device: Int!
		desktop: Int!
	}

	extend type Query {
		countTokensUsers(filter: JSON): UsersTokens!
	}

	extend type Mutation {
		pushNotificationToken(userId: ID!, token: String!, type: String): Boolean!
		removeNotificationToken(token: String!, type: String): Boolean!
	
		sendNotification(to: [ID], filter: JSON, title: String!, body: String!): UsersTokens!
	}
`;

export const resolvers =  {
	Query: {
		async countTokensUsers(_, { filter }) {
			const where = sanitizeFilter(filter, { excludeFilters: ['types'] });

			const users = await UserController.filterUsers(where);

			const deviceTokens = !filter.types || filter.types.includes('device') ? await UserController.getTokensById(users.map(u=>u.id), DEVICE_TOKEN_META) : [];
			const desktopTokens =  !filter.types || filter.types.includes('desktop') ? await UserController.getTokensById(users.map(u=>u.id), DESKTOP_TOKEN_META) : [];

			return {
				device: deviceTokens.length,
				desktop: desktopTokens.length
			}

		},
	},
	Mutation: {
		async sendNotification(_, { to, filter, title, body }) {
			if (!to) {
				const where = sanitizeFilter(filter, { excludeFilters: ['types'] });

				const users = await UserController.filterUsers(where);

				to = users.map(u=>u.id);
			}
			
			const deviceTokens = !filter.types || filter.types.includes('device') ? await UserController.getTokensById(to, DEVICE_TOKEN_META) : [];
			const desktopTokens =  !filter.types || filter.types.includes('desktop') ? await UserController.getTokensById(to, DESKTOP_TOKEN_META) : [];

			const message = {
				title,
				body,
				data: {
					alertOn: ['selected', 'received'],
					alertData: {
						title,
						body,
					}
				}
			}

			JobQueue.notifications.add('simpleNotification', { desktopTokens, deviceTokens, message })

			return {
				device: deviceTokens.length,
				desktop: desktopTokens.length
			}
		},
		pushNotificationToken(_, { userId, token, type='device' }) {
			return NotificationController.addToken(userId, token, type)
		},
		removeNotificationToken(_, { token, type='device' }) {
			return NotificationController.removeToken(token, type);
		}
	}
}