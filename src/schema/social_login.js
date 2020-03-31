import { gql }  from 'apollo-server';
import jwt from 'jsonwebtoken';

import User from '../model/user';
import UserMeta from '../model/userMeta';

/* input GoogleUser {
		id: ID
		name: String
		givenName: String
		familyName: String
		photoUrl: String
		email: String
	}

	input GoogleLoginResult {
		type: String
		accessToken: String
		idToken: String
		refreshToken: String
		user: GoogleUser!
	} */

export const typeDefs = gql`
	input SocialUser {
		id: String
		firstName: String
		lastName: String
		email: String
		image: String
	}

	extend type User {
		socialLogin: Boolean!
	}

	extend type Mutation {
		socialLogin(type: String!, data: SocialUser!): Login!
	}
`;

export const resolvers = {
	User: {
		async socialLogin(parent) {
			//google social
			const checkGoogleLogin = await parent.getMetas({ where: { key: '_google_userId' } });
			const checkFacebookLogin = await parent.getMetas({ where: { key: '_facebook_userId' } });

			return Boolean(checkGoogleLogin.length || checkFacebookLogin.length);
		},
	},
	Mutation: {
		async socialLogin(_, { type, data }) {
			const metaKey = `_${type}_userId`;
			const socialUserId = data.id;
			delete data.id;

			const checkUserId = await UserMeta.findOne({ where: { key: metaKey, value: socialUserId } });
			let user;

			if (!checkUserId) {
				// check email
				const userEmailFound = await User.findOne({ where: { email: data.email } });
				if (userEmailFound) throw new Error('Este email já está cadastrado, tente logar utilizando login e senha');

				// create user
				const newUserData = {
					...data,
					role: 'customer',
					metas: [
						{
							key: metaKey,
							value: socialUserId
						}
					]
				}

				user = await User.create(newUserData, { include: [UserMeta] });
			} else {
				// load existing user
				user = await checkUserId.getUser();
			}
			if (!user) throw new Error('Usuário não encontrado');

			//Gera webtoken com id e email
			const token = jwt.sign({
				id: user.get('id'),
				email: user.get('email'),
			}, process.env.SECRET);

			return {
				token,
				user,
			}
		},
	}
}