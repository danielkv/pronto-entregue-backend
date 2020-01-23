import { gql }  from 'apollo-server';
import jwt  from 'jsonwebtoken';
import{ Op }  from 'sequelize';

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
		email: String!
		role: String!
		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!

		metas (type: String): [Meta]!
		addresses: [Address]!
		
		orders: [Order]!
		company(companyId: ID!): Company

		countCompanies(filter: Filter): Int! @hasRole(permission: "companies_read")
		companies(filter: Filter, pagination: Pagination): [Company]! @hasRole(permission: "companies_read")

		favoriteProducts(pagination: Pagination): [Product]!
	}

	input UserInput {
		firstName: String
		lastName: String
		password: String
		email: String
		active: Boolean
		metas: [MetaInput]

		assignCompany: Boolean
		role: String
	}

	type Login {
		user: User!
		token: String!
	}

	extend type Mutation {
		login (email: String!, password: String!): Login!
		authenticate (token: String!): User!
		
		createUser (data: UserInput!): User!
		updateUser (id: ID!, data: UserInput!): User! @hasRole(permission: "users_edit", checkSameUser: true)

		removeUserAddress (id: ID!): Address! @isAuthenticated
		updateUserAddress (id: ID!, data: AddressInput!): Address! @isAuthenticated
		createUserAddress (data: AddressInput!): Address! @isAuthenticated
	}

	extend type Query {
		countUsers(filter: Filter): Int! @hasRole(permission: "master")
		users(filter: Filter, pagination: Pagination): [User]! @hasRole(permission: "master")
		user(id: ID!): User!
		searchCompanyUsers(search: String!): [User]!
		me: User! @isAuthenticated

		userAddress (id: ID!): Address! @isAuthenticated
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
		user: (_, { id }, ctx) => {

			if (
				(ctx.user && !ctx.user.can('users_read')) &&
				!ctx.user.id === id
			) throw new Error('Você não tem autorização')

			return User.findByPk(id)
				.then(user => {
					if (!user) throw new Error('Usuário não encontrada');
					return user;
				});
		},
		searchCompanyUsers(_, { search }, { company }) {
			return company.getUsers({
				where: {
					[Op.or]: [{ firstName: { [Op.like]: `%${search}%` } }, { lastName: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }]
				}
			})
		},
		userAddress: (parent, { id }, ctx) => {
			return ctx.user.getMetas({ where: { id } })
				.then(([address]) => {
					if (!address) throw new Error('Endereço não encontrado');

					return {
						id: address.id,
						...JSON.parse(address.value)
					};
				})
		},
	},
	Mutation: {
		createUser: async (_, { data }, { user, company }) => {
			// if user cannot set role throw an error
			userCanSetRole(data.role, user);

			return conn.transaction(async (transaction) => {
				// check if email exists in database
				const userExists = await User.findOne({ where: { email: data.email } });
				if (userExists) throw new Error('Esse email já está cadastrado');

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
		updateUser: (_, { id, data }, { user, company }) => {
			// if user cannot set role throw an error
			userCanSetRole(data.role, user);

			return conn.transaction(async (transaction) => {
				// check if user exists
				const user = await User.findByPk(id);
				if (!user) throw new Error('Usuário não encontrada');

				// extract Role
				const { roleName, role } = await extractRole(data.role);
				// sanitize role data
				data.role = roleName;

				// update user
				const updatedUser = await user.update(data, { fields: ['firstName', 'lastName', 'password', 'role', 'active'], transaction })
				
				// case needs to update metas
				if (data.metas) await UserMeta.updateAll(data.metas, updatedUser, transaction);

				// case assignCompany is true
				if (data.assignCompany === true && roleName === 'adm')
					await company.addUser(updatedUser, { through: { roleId: role.get('id') }, transaction });
				else
					await company.removeUser(updatedUser, { transaction });

				return updatedUser;
			})
		},
		/*
		* Autoriza usuário retornando o token com dados,
		* caso autenticação falhe, 'arremessa' um erro
		* 
		*/
		login: (_, { email, password }) => {
			return User.findOne({
				where: { email },
			})
				.then ((userFound)=>{
					//Verifica se encontrou usuário
					if (!userFound) throw new Error('Usuário não encotrado');
			
					//gera token com senha recebidos e salt encontrado e verifica se token salvo é igual
					const salted = salt(password, userFound.salt);
					if (userFound.password != salted.password) throw new Error('Senha incorreta');
					
					//Gera webtoken com id e email
					const token = jwt.sign({
						id: userFound.id,
						email: userFound.email,
					}, process.env.SECRET);
					
					//Retira campos para retornar usuário
					const authorized = userFound.get();
			
					return {
						token,
						user: authorized,
					};
				});
		},
		authenticate: async (_, { token }) => {
			// break the token
			const { id, email } = jwt.verify(token, process.env.SECRET);

			// check if user exists
			const userFound = await User.findOne({ where: { id, email } });
			if (!userFound) throw new Error('Usuário não encotrado');

			return userFound;
		},
		removeUserAddress: (_, { id }) => {
			return UserMeta.findByPk(id)
				.then(async (addressFound)=>{
					if (!addressFound) throw new Error('Endereço não encontrado');

					const removed = await addressFound.destroy();

					return { id, ...JSON.parse(removed.value) };
				})
		},
		updateUserAddress: (_, { id, data }, ctx) => {
			return ctx.user.getMetas({ where: { key: 'address', id } })
				.then(async ([addressFound])=>{
					if (!addressFound) throw new Error('Endereço não encontrado');
					
					const updated = await addressFound.update({ value: JSON.stringify(data) })
					
					return { id, ...JSON.parse(updated.value) };
				});
		},
		createUserAddress: (_, { data }, ctx) => {
			return ctx.user.createMeta({ key: 'address', value: JSON.stringify(data) })
				.then((metaAddress) => {
					console.log(metaAddress.get());
					return {
						id: metaAddress.get('id'),
						...JSON.parse(metaAddress.get('value'))
					}
				})
		},
	},
	User: {
		addresses: (parent) => {
			return parent.getMetas({ where: { key: 'address' } })
				.then(metas=>{
					return metas.map(meta=> {
						return {
							id: meta.id,
							...JSON.parse(meta.value)
						}
					});
				})
		},
		fullName: (parent) => {
			return `${parent.firstName} ${parent.lastName}`;
		},
		metas: (parent, { type }) => {
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
		orders: (parent) => {
			return parent.getOrders();
		},
		favoriteProducts(parent, { pagination }) {
			return parent.getFavoriteProducts({
				...getSQLPagination(pagination)
			});
		}
	}
}