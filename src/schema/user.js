import { gql }  from 'apollo-server';
import jwt from 'jsonwebtoken';
import { Op }  from 'sequelize';

import { upload } from '../controller/uploads';
import JobQueue from '../factory/queue';
import { userAddressesIdsLoader, addressLoader } from '../loaders';
import Address  from '../model/address';
import Company  from '../model/company';
import User  from '../model/user';
import UserMeta  from '../model/userMeta';
import conn  from '../services/connection';
import { salt, getSQLPagination, sanitizeFilter }  from '../utilities';
import { userCanSetRole, extractRole } from '../utilities/roles';

export const typeDefs = gql`

	type CompanyRelation {
		active: Boolean!
	}

	type User {
		id: ID!
		fullName: String!
		firstName: String!
		lastName: String!
		image: String
		email: String!
		role: String!
		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!

		metas (type: String): [Meta]!
		addresses: [Address]!
		
		countOrders: Int!
		orders(pagination: Pagination): [Order]!
		company(companyId: ID!): Company

		countCompanies(filter: JSON): Int!
		companies(filter: JSON, pagination: Pagination): [Company]!

		favoriteProducts(pagination: Pagination): [Product]!
	}

	input UserInput {
		firstName: String
		lastName: String
		password: String
		email: String
		active: Boolean
		metas: [MetaInput]
		addresses: [AddressInput]

		assignCompany: Boolean
		role: String
	}

	type Login {
		user: User!
		token: String!
	}

	extend type Mutation {
		searchUsers(search: String!, exclude: [ID], companies: [ID]): [User]!

		login (email: String!, password: String!): Login!
		authenticate (token: String!): User!
		
		createUser (data: UserInput!): User!
		updateUser (id: ID!, data: UserInput!): User! @hasRole(permission: "master", checkSameUser: true)
		updateUserImage(userId: ID!, image: Upload!): User!

		recoverPassword(email: String!): Boolean!
		updateUserPassword(token: String!, newPassword: String!): Boolean!
		sendNewPasswordEmail(userId: ID!): Boolean!

		removeUserAddress (id: ID!): Address! @isAuthenticated
		updateUserAddress (id: ID!, data: AddressInput!): Address! @isAuthenticated
		#deprecated
		createUserAddress (data: AddressInput!): Address! @isAuthenticated

		setUserAddress(addressData: AddressInput!, userId: ID): Address!
	}

	extend type Query {
		countUsers(filter: JSON): Int! @hasRole(permission: "master")
		users(filter: JSON, pagination: Pagination): [User]! @hasRole(permission: "master")
		user(id: ID!): User! @hasRole(permission: "master", checkSameUser: true)
		me: User! @isAuthenticated

		#userAddress (id: ID!): Address! @isAuthenticated
	}

`;

export const resolvers = {
	Query: {
		me: (_, __, { user }) => {
			return user;
		},
		users: (_, { filter, pagination }) => {
			const search = ['firstName', 'lastName', 'email'];
			const where = sanitizeFilter(filter, { search, table: 'order' });

			return User.findAll({
				where,
				order: [['firstName', 'ASC'], ['lastName', 'ASC']],
				...getSQLPagination(pagination),
			});
		},
		countUsers: (_, { filter }) => {
			const search = ['firstName', 'lastName', 'email'];
			const where = sanitizeFilter(filter, { search, table: 'order' });

			return User.count({ where });
		},
		user: async (_, { id }) => {
			const user = await User.findByPk(id);
			if (!user) throw new Error('Usuário não encontrada');
			return user;
		},
	},
	Mutation: {
		searchUsers(_, { search, exclude = [], companies }) {
			const where = sanitizeFilter({ search }, { search: ['firstName', 'lastName'] });
			if (companies) where['$company.id$'] = companies;

			return User.findAll({
				where: { ...where, active: true, id: { [Op.notIn]: exclude } },
				include: [Company],
				limit: 10
			});
		},
		createUser(_, { data }, { user, company }) {
			// if user cannot set role throw an error
			userCanSetRole(data.role, user);

			return conn.transaction(async (transaction) => {
				// check if email exists in database
				const userExists = await User.findOne({ where: { email: data.email } });
				if (userExists) throw new Error('Esse email já está cadastrado');

				//if (!data.role) data.role = 'customer';

				// extract Role
				const { roleName, role } = await extractRole(data.role);
				// sanitize role data
				data.role = roleName;

				// create new user
				const createdUser = await User.create(data, { include: [UserMeta], transaction });

				// case assignCompany is true
				if (data.assignCompany === true && roleName === 'adm') await company.addUser(createdUser, { through: { roleId: role.get('id') }, transaction });

				return createdUser
			});
		},
		updateUser(_, { id, data }, { user, company }) {
			// if user cannot set role throw an error
			userCanSetRole(data.role, user);

			return conn.transaction(async (transaction) => {
				// check if user exists
				const user = await User.findByPk(id);
				if (!user) throw new Error('Usuário não encontrada');

				// if update role
				if (data.role) {
					// extract Role
					const { roleName, role } = await extractRole(data.role);
					// sanitize role data
					data.role = roleName;

					// case assignCompany is true
					if (data.assignCompany === true && roleName === 'adm')
						await company.addUser(user, { through: { roleId: role.get('id') }, transaction });
					else
						await company.removeUser(user, { transaction });
				}

				// update user
				const updatedUser = await user.cache().update(data, { fields: ['firstName', 'lastName', 'email', 'password', 'salt', 'role', 'active'], transaction })

				// update user addresses
				if (data.addresses) {
					const deleteAddresses = await user.getAddresses({ where: { id: { [Op.notIn]: data.addresses.map(add=>add.id) } } })

					await Promise.all(deleteAddresses.map(address => {
						return address.destroy();
					}));
				}
				
				// case needs to update metas
				if (data.metas) await UserMeta.updateAll(data.metas, updatedUser, transaction);

				return updatedUser;
			})
		},
		async recoverPassword(_, { email }) {
			const user = await User.findOne({ where: { email } });
			if (!user) throw new Error('Esse email não foi encontrado');

			const expiresIn = 10;

			const token = jwt.sign({
				id: user.get('id'),
				email: user.get('email'),
				salt: user.get('salt')
			}, process.env.SECRET_RECOVERY, { expiresIn: `${expiresIn}h` });

			const data = {
				to: user.get('email'),
			}

			const context = {
				user,
				link: `https://prontoentregue.com.br/nova-senha/${token}`,
				expiresIn
			}

			// add recovery message to queue
			JobQueue.mails.add('mail', {
				template: 'recover-password',
				data,
				context
			})
			

			return true;
		},

		async sendNewPasswordEmail(_, { userId }) {
			const user = await User.findByPk(userId);
			if (!user) throw new Error('Usuário não foi encontrado');

			const expiresIn = 2;

			const token = jwt.sign({
				id: user.get('id'),
				email: user.get('email'),
				salt: user.get('salt')
			}, process.env.SECRET_RECOVERY, { expiresIn: `${expiresIn}h` });

			const data = {
				to: user.get('email'),
			}

			const context = {
				user,
				link: `https://prontoentregue.com.br/nova-senha/${token}`,
				expiresIn
			}

			// add new password message to queue
			JobQueue.mails.add('mail', {
				template: 'new-password',
				data,
				context
			})

			return true;
		},
		
		async updateUserPassword(_, { token, newPassword }) {
			try {
				const data = jwt.verify(token, process.env.SECRET_RECOVERY);

				const user = await User.findByPk(data.id);
				if (!user) throw new Error('Usuário não encontrado');

				if (user.get('salt') !== data.salt) throw new Error('Esse token já foi utilizado')

				await user.update({ password: newPassword });
				
				return true;
			} catch(err) {
				switch (err.name) {
					case 'TokenExpiredError': throw new Error('O token já expirou');
					case 'JsonWebTokenError': throw new Error('O token é inválido');
					default: throw err;
				}
			}
		},

		async updateUserImage(_, { userId, image }) {
			//check if user exists
			const user = await User.findByPk(userId);
			if (!user) throw new Error('Usuário não encontrado');
			
			// upload file
			const imageUrl = await upload('user-profiles', await image);

			// update user data on DB
			return await user.update({ image: imageUrl })

		},

		/*
		* Autoriza usuário retornando o token com dados,
		* caso autenticação falhe, 'arremessa' um erro
		* 
		*/
		login(_, { email, password }, { admOrigin }) {
			return User.findOne({
				where: { email },
			})
				.then ((userFound)=>{
					//Verifica se encontrou usuário
					if (!userFound) throw new Error('Usuário não encotrado');
			
					//gera token com senha recebidos e salt encontrado e verifica se token salvo é igual
					const salted = salt(password, userFound.salt);
					if (userFound.password != salted.password) throw new Error('Senha incorreta');

					// check if user is active
					if (!userFound.get('active')) throw new Error('Usuário inativo')

					// check if user is a customer trying to access adm area
					if (admOrigin && userFound.get('role') === 'customer') throw new Error('Você não tem permissões para acessar essa página')
					
					//Gera webtoken com id e email
					const token = jwt.sign({
						id: userFound.id,
						email: userFound.email,
					}, process.env.SECRET);
					
					return {
						token,
						user: userFound,
					};
				});
		},
		async authenticate (_, { token }) {
			// break the token
			const { id, email } = jwt.verify(token, process.env.SECRET);

			// check if user exists
			const userFound = await User.findOne({ where: { id, email } });
			if (!userFound) throw new Error('Usuário não encotrado');

			if (!userFound.get('active')) throw new Error('Usuário inativo')

			return userFound;
		},
		// deprecated
		createUserAddress (_, { data }, ctx) {
			return ctx.user.createAddress(data);
		},
		async setUserAddress(_, { addressData, userId = null }) {
			let address;
			if (addressData.id) address = await Address.findByPk(addressData.id);
			if (!address) address = await Address.create(addressData);

			if (userId) {
				const user = await User.findByPk(userId);
				user.addAddress(address);
			}

			return address;
		}
	},
	User: {
		async addresses(parent) {
			if (parent.addresses) return parent.addresses;

			const userId = parent.get('id')
			const addressesIds = await userAddressesIdsLoader.load(userId);

			const addresses = await addressLoader.loadMany(addressesIds);

			return addresses;
		},
		fullName: (parent) => {
			return `${parent.firstName} ${parent.lastName}`;
		},
		metas(parent, { type }) {
			let where = {};

			if (type) {
				where = { where: { key: type } }
			}

			return parent.getMetas(where);
		},
		countCompanies: (parent, { filter }) => {
			const _filter = sanitizeFilter(filter, { search: ['name', 'displayName'] });

			if (parent.role == 'master')
				return Company.count({
					where: _filter
				});

			return parent.countCompanies({
				where: _filter,
				through: { where: { active: true } }
			});

		},
		companies: (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter, { search: ['name', 'displayName'] });

			if (parent.role == 'master')
				return Company.findAll({
					where: _filter,
					...getSQLPagination(pagination)
				});

			return parent.getCompanies({
				where: _filter,
				...getSQLPagination(pagination),
				through: { where: { active: true } }
			});
		},
		async company(parent, { companyId }, { user }) {
			// check if company exists
			const [_company] = await parent.getCompanies({ where: { id: companyId } });
			if (!_company) {
				if (!user.can('master')) throw new Error('Empresa não encontrada');
				return null;
			}

			return _company;
		},
		countOrders: (parent) => {
			return parent.countOrders();
		},
		orders: (parent, { pagination }) => {
			return parent.getOrders({
				...getSQLPagination(pagination),
				order: [['createdAt', 'DESC']],
			});
		},
		favoriteProducts(parent, { pagination }) {
			return parent.getFavoriteProducts({
				where: { active: true },
				include: [{
					model: Company,
					where: { published: true, active: true }
				}],
				...getSQLPagination(pagination)
			});
		}
	}
}