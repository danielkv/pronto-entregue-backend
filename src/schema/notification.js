import { gql }  from 'apollo-server';
import { Op } from 'sequelize';

import User from '../model/user';
import UserMeta from '../model/userMeta';

export const typeDefs =  gql`
	extend type Mutation {
		pushNotificationToken(userId: ID!, token: String!): Boolean!
		removeNotificationToken(token: String!): Boolean!
	}
`;

export const resolvers =  {
	Mutation: {
		async pushNotificationToken(_, { userId, token }) {
			let tokens = [];

			// check if user exists
			const user = await User.findByPk(userId);
			if (!user) throw new Error('Usuário não encontrado');

			// check if meta exists
			const [meta] = await user.getMetas({ where: { key: 'notification_tokens' } })
			if (meta) tokens = JSON.parse(meta.value);

			//check if token exists
			if (tokens.includes(token)) return true;
			tokens.push(token);

			// save tokens
			if (!meta) await user.createMeta({ key: 'notification_tokens', value: JSON.stringify(tokens) });
			else await meta.update({ value: JSON.stringify(tokens) });

			return true;
		},
		async removeNotificationToken(_, { token }) {
			// check if meta exists
			const meta = await UserMeta.findOne({ where: { key: 'notification_tokens', value: { [Op.like]: `%${token}%` } } });
			if (!meta) throw new Error('Token não encontrado');
			
			// parse tokens
			const tokens = JSON.parse(meta.value);
			const tokenIndex = tokens.findIndex(t => t === token);
			if (tokenIndex === -1) throw new Error('Token não encontrado');

			// remove token
			tokens.splice(tokenIndex, 1);

			// save tokens
			await meta.update({ value: JSON.stringify(tokens) });

			return true;
		}
	}
}