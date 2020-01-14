import { gql }  from 'apollo-server';
import jwt  from 'jsonwebtoken';
import conn  from 'sequelize';

import Branches  from '../model/branch';
import Companies  from '../model/company';
import Roles  from '../model/role';
import Users  from '../model/user';
import UsersMeta  from '../model/userMeta';
import sequelize  from '../services/connection';
import { salt, getSQLPagination, sanitizeFilter }  from '../utilities';

const Op = conn.Op;

export const typeDefs = gql`
	type UserMeta {
		id: ID!
		key: String!
		value: String!
		createdAt: String! @dateTime
	}

	type CompanyRelation {
		active: Boolean!
	}

	type BranchRelation {
		active: Boolean!
		role: Role!
		roleId: Int!
	}

	type User {
		id: ID!
		fullName: String!
		firstName: String!
		lastName: String!
		email: String!
		role: String!
		active: Boolean!
		createdAt: String! @dateTime
		updatedAt: String! @dateTime

		metas (type: String): [UserMeta]!
		addresses: [Address]!
		
		orders: [Order]!
		branchRelation: BranchRelation!
		company(companyId: ID!): Company!

		countCompanies(filter: Filter): Int! @hasRole(permission: "companies_read", scope: "adm")
		companies(filter: Filter, pagination: Pagination): [Company]! @hasRole(permission: "companies_read", scope: "adm")
	}

	input UserInput {
		firstName: String
		lastName: String
		password: String
		role: String
		email: String
		active: Boolean

		assignedBranches: [AssignedBranchInput]
		assignedCompany: AssignedCompanyInput
		metas: [UserMetaInput]
	}

	input AssignedCompanyInput {
		active: Boolean!
	}

	input AssignedBranchInput {
		id: ID!
		action: String!
		userRelation: BranchUserRelationInput!
	}

	input BranchUserRelationInput {
		active: Boolean!
		roleId: ID!
	}

	input UserMetaInput {
		id: ID
		action: String! #create | update | delete
		key: String
		value: String
	}

	type Login {
		user: User!
		token: String!
	}

	extend type Mutation {
		login (email: String!, password: String!): Login!
		authenticate (token: String!): User!
		
		createUser (data: UserInput!): User!
		updateUser (id: ID!, data: UserInput!): User!
		
		setUserRole (id: ID!, roleId: ID!): User! @hasRole(permission: "adm")
		setUserScopeRole (id: ID!, role: String!): User! @hasRole(permission: "adm")

		removeUserAddress (id: ID!): Address! @isAuthenticated
		updateUserAddress (id: ID!, data: AddressInput!): Address! @isAuthenticated
		createUserAddress (data: AddressInput!): Address! @isAuthenticated
	}

	extend type Query {
		user(id: ID!): User!
		searchCompanyUsers(search: String!): [User]!
		me: User! @isAuthenticated

		userAddress (id: ID!): Address! @isAuthenticated
	}

`;

export const resolvers = {
	Query: {
		me: (_, __, ctx) => {
			return ctx.user;
		},
		users: () => {
			return Users.findAll();
		},
		user: (_, { id }, ctx) => {

			if (
				(ctx.user && !ctx.user.can('users_read', { scope: 'adm' })) &&
				!ctx.user.id === id
			) throw new Error('Você não tem autorização')

			return Users.findByPk(id)
				.then(user => {
					if (!user) throw new Error('Usuário não encontrada');
					return user;
				});
		},
		searchCompanyUsers: (parent, { search }, ctx) => {
			return ctx.company.getUsers({
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
		createUser: (parent, { data }, ctx) => {
			if (data.role === 'default' || data.role === 'adm') {
				if (!ctx.user.can('adm')) throw new Error(`Você não tem premissões para cadastrar um usuário com permissão ${data.role}`);
			}
			
			if (data.role === 'master') {
				if (!ctx.user.can('master')) throw new Error(`Você não tem premissões para cadastrar um usuário com permissão ${data.role}`);
			}

			return sequelize.transaction(async transaction => {
				await ctx.company.getUsers({ where: { email: data.email } })
					.then((users)=>{
						if (users.length) throw new Error('Já existe um usuário com esse email')
					})

				return Users.create(data, { include: [UsersMeta], transaction })
					.then(async (userCreated)=> {
						await ctx.company.addUser(userCreated, { through: { ...data.assignedCompany }, transaction });

						return userCreated;
					})
					.then(async (userCreated)=> {
						if (data.assignedBranches) {
							await Branches.assignAll(data.assignedBranches, userCreated, transaction);
						}
						return userCreated;
					})
			});
		},
		updateUser: (parent, { id, data }, ctx) => {
			if (data.role === 'default' || data.role === 'adm') {
				if (!ctx.user.can('adm')) throw new Error(`Você não tem premissões para cadastrar um usuário com permissão ${data.role}`);
			}
			
			if (data.role === 'master') {
				if (!ctx.user.can('master')) throw new Error(`Você não tem premissões para cadastrar um usuário com permissão ${data.role}`);
			}

			return sequelize.transaction(transaction => {
				return Users.findByPk(id)
					.then(user=>{
						if (!user) throw new Error('Usuário não encontrada');

						return user.update(data, { fields: ['firstName', 'lastName', 'password', 'role', 'active'], transaction })
					})
					.then(async (userUpdated) => {
						if (data.metas) {
							await UsersMeta.updateAll(data.metas, userUpdated, transaction);
						}
						return userUpdated;
					})
					.then(async (userUpdated)=> {
						await ctx.company.addUser(userUpdated, { through: { ...data.assignedCompany }, transaction });

						return userUpdated;
					})
					.then(async (userUpdated)=> {
						if (data.assignedBranches) {
							await Branches.assignAll(data.assignedBranches, userUpdated, transaction);
						}
						return userUpdated;
					})
			})
		},
		setUserScopeRole: (_, { id, role }, ctx) => {
			return ctx.company.getUsers({ where: { id } })
				.then(async ([user])=>{
					if (!user) throw new Error('Usuário não encontrada');

					const userUpdated = await user.update({ role });

					return userUpdated;
				});
		},
		setUserRole: (_, { id, roleId }, ctx) => {
			return ctx.branch.getUsers({ where: { id } })
				.then(async ([user])=>{
					if (!user || !user.branchRelation) throw new Error('Usuário não encontrada');
					const role = await Roles.findByPk(roleId);
					if (!role) throw new Error('Função não encontrada');

					await user.branchRelation.setRole(role);
					
					return user;
				});
		},
		/*
		* Autoriza usuário retornando o token com dados,
		* caso autenticação falhe, 'arremessa' um erro
		* 
		*/
		login: (parent, { email, password }) => {
			return Users.findOne({
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
		authenticate: (_, { token }) => {
			const { id, email } = jwt.verify(token, process.env.SECRET);

			return Users.findAll({ where: { id, email } })
				.then(([userFound])=>{
					if (!userFound) throw new Error('Usuário não encotrado');

					return userFound;
				})
		},
		removeUserAddress: (parent, { id }) => {
			return UsersMeta.findByPk(id)
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
				return Companies.count({
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
				return Companies.findAll({
					where: _filter,
					...getSQLPagination(pagination)
				});

			return parent.getCompanies({
				where: _filter,
				...getSQLPagination(pagination),
				through: { where: { active: true } }
			});
		},
		company: (parent, { companyId }) => {
			return parent.getCompanies({ where: { id: companyId } })
				.then (([company])=>{
					if (!company) throw new Error('Empresa não encontrada');

					return company;
				})
		},
		branchRelation: (parent) => {
			if (!parent.branchUsers) throw new Error('Nenhum usuário selecionado');
			
			return parent.branchUsers.getRole()
				.then(role => {
					return {
						role,
						active: parent.branchUsers.active
					}
				})
		},
		orders: (parent) => {
			return parent.getOrders();
		},
	}
}