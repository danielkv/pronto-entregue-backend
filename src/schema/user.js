const sequelize = require('../services/connection');
const Op = require('sequelize').Op;
const jwt = require('jsonwebtoken');
const {gql} = require('apollo-server');
const Users = require('../model/users');
const UsersMeta = require('../model/users_meta');
const Companies = require('../model/companies');
const Branches = require('../model/branches');
const Roles = require('../model/roles');
const {salt} = require('../utilities');

module.exports.typeDefs = gql`
	type UserMeta {
		id:ID!
		meta_type:String!
		meta_value:String!
		createdAt:String! @dateTime
	}

	type CompanyRelation {
		active:Boolean!
	}

	type BranchRelation {
		active:Boolean!
		role: Role!
		role_id: Int!
	}

	type User {
		id:ID!
		full_name:String!
		first_name:String!
		last_name:String!
		email:String!
		role:String!
		active:Boolean!
		createdAt:String! @dateTime
		updatedAt:String! @dateTime

		metas (type: String): [UserMeta]!
		addresses:[Address]!
		
		orders: [Order]!
		branch_relation:BranchRelation!
		company(company_id:ID!): Company!
		companies(filter:Filter):[Company]! @hasRole(permission:"companies_read", scope:"adm")
	}

	input UserInput {
		first_name:String
		last_name:String
		password:String
		role:String
		email:String
		active:Boolean

		assigned_branches:[AssignedBranchInput]
		assigned_company:AssignedCompanyInput
		metas:[UserMetaInput]
	}

	input AssignedCompanyInput {
		active:Boolean!
	}

	input AssignedBranchInput {
		id:ID!
		action:String!
		user_relation: BranchUserRelationInput!
	}

	input BranchUserRelationInput {
		active:Boolean!
		role_id:ID!
	}

	input UserMetaInput {
		id:ID
		action:String! #create | update | delete
		meta_type:String
		meta_value:String
	}

	type Login {
		user:User!
		token:String!
	}

	extend type Mutation {
		login (email:String!, password:String!): Login!
		authenticate (token:String!): User!
		
		createUser (data:UserInput!): User!
		updateUser (id:ID!, data:UserInput!): User!
		
		setUserRole (id:ID!, role_id:ID!):User! @hasRole(permission:"adm")
		setUserScopeRole (id:ID!, role:String!):User! @hasRole(permission:"adm")

		removeUserAddress (id: ID!): Address! @isAuthenticated
		updateUserAddress (id: ID!, data: UserAddressInput!): Address! @isAuthenticated
		createUserAddress (data: UserAddressInput!): Address! @isAuthenticated
	}

	extend type Query {
		user(id:ID!): User! @hasRole(permission:"users_read", scope:"adm")
		searchCompanyUsers(search:String!):[User]!
		me:User! @isAuthenticated

		userAddress (id: ID!): Address! @isAuthenticated
	}

`;

module.exports.resolvers = {
	Query : {
		me: (parent, args, ctx) => {
			return ctx.user;
		},
		users : (parent, args, ctx) => {
			return Users.findAll();
		},
		user:(parent, {id}, ctx) => {
			return Users.findByPk(id)
			.then(user => {
				if (!user) throw new Error('Usuário não encontrada');
				return user;
			});
		},
		searchCompanyUsers: (parent, {search}, ctx) => {
			return ctx.company.getUsers({where:{
				[Op.or] : [{first_name:{[Op.like]:`%${search}%`}}, {last_name:{[Op.like]:`%${search}%`}}, {email:{[Op.like]:`%${search}%`}}]
			}})
		},
		userAddress: (parent, { id }, ctx) => {
			return ctx.user.getMetas({ where: { id }})
				.then(([address]) => {
					if (!address) throw new Error('Endereço não encontrado');

					return {
						id: address.id,
						...JSON.parse(address.meta_value)
					};
				})
		},
	},
	Mutation : {
		createUser: (parent, {data}, ctx) => {
			if (data.role === 'default' || data.role === 'adm') {
				if (!ctx.user.can('adm')) throw new Error(`Você não tem premissões para cadastrar um usuário com permissão ${data.role}`);
			}
			
			if (data.role === 'master') {
				if (!ctx.user.can('master')) throw new Error(`Você não tem premissões para cadastrar um usuário com permissão ${data.role}`);
			}

			return sequelize.transaction(async transaction => {
				await ctx.company.getUsers({where:{email:data.email}})
					.then((users)=>{
						if (users.length) throw new Error('Já existe um usuário com esse email')
					})

				return Users.create(data, {include:[UsersMeta], transaction})
					.then(async (user_created)=> {
						await ctx.company.addUser(user_created, {through:{...data.assigned_company}, transaction});

						return user_created;
					})
					.then(async (user_created)=> {
						if (data.assigned_branches) {
							await Branches.assignAll(data.assigned_branches, user_created, transaction);
						}
						return user_created;
					})
			});
		},
		updateUser: (parent, {id, data}, ctx) => {
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

						return user.update(data, { fields: ['first_name', 'last_name', 'password', 'role', 'active'], transaction })
					})
					.then(async (user_updated) => {
						if (data.metas) {
							await UsersMeta.updateAll(data.metas, user_updated, transaction);
						}
						return user_updated;
					})
					.then(async (user_updated)=> {
						await ctx.company.addUser(user_updated, {through:{...data.assigned_company}, transaction});

						return user_updated;
					})
					.then(async (user_updated)=> {
						if (data.assigned_branches) {
							await Branches.assignAll(data.assigned_branches, user_updated, transaction);
						}
						return user_updated;
					})
			})
		},
		setUserScopeRole : (parent, {id, role}, ctx) => {
			return ctx.company.getUsers({where:{id}})
				.then(async ([user])=>{
					if (!user) throw new Error('Usuário não encontrada');

					const user_updated = await user.update({role});

					return user_updated;
				});
		},
		setUserRole : (parent, {id, role_id}, ctx) => {
			return ctx.branch.getUsers({where:{id}})
				.then(async ([user])=>{
					if (!user || !user.branch_relation) throw new Error('Usuário não encontrada');
					const role = await Roles.findByPk(role_id);
					if (!role) throw new Error('Função não encontrada');

					await user.branch_relation.setRole(role);
					
					return user;
				});
		},
		/*
		* Autoriza usuário retornando o token com dados,
		* caso autenticação falhe, 'arremessa' um erro
		* 
		*/
		login : (parent, {email, password}, ctx) => {
			return Users.findOne({
				where : {email},
			})
				.then ((user_found)=>{
					//Verifica se encontrou usuário
					if (!user_found) throw new Error('Usuário não encotrado');
			
					//gera token com senha recebidos e salt encontrado e verifica se token salvo é igual
					const salted = salt(password, user_found.salt);
					if (user_found.password != salted.password) throw new Error('Senha incorreta');
					
					//Gera webtoken com id e email
					const token = jwt.sign({
						id: user_found.id,
						email: user_found.email,
					}, process.env.SECRET);
					
					//Retira campos para retornar usuário
					const authorized = user_found.get();
			
					return {
						token,
						user:authorized,
					};
				});
		},
		removeUserAddress: (parent, { id }) => {
			return UsersMeta.findByPk(id)
				.then(async (address_found)=>{
					if (!address_found) throw new Error('Endereço não encontrado');

					const removed = await address_found.destroy();

					return {id, ...JSON.parse(removed.meta_value)};
				})
		},
		updateUserAddress: (parent, { id, data }, ctx) => {
			return ctx.user.getMetas({ where: { meta_type: 'address', id } })
				.then(async ([address_found])=>{
					if (!address_found) throw new Error('Endereço não encontrado');
					
					const updated = await address_found.update({ meta_value: JSON.stringify(data) })
					
					return {id, ...JSON.parse(updated.meta_value)};
				});
		},
		createUserAddress: (parent, { data }, ctx) => {
			return ctx.user.createMeta({ meta_type: 'address', meta_value: JSON.stringify(data) })
				.then((meta_address) => {
					console.log(meta_address.get());
					return {
						id: meta_address.get('id'),
						...JSON.parse(meta_address.get('meta_value'))
					}
				})
		},
	},
	User: {
		addresses : (parent, args, ctx) => {
			return parent.getMetas({where:{meta_type:'address'}})
			.then(metas=>{
				return metas.map(meta=> {
					return {
						id: meta.id,
						...JSON.parse(meta.meta_value)
					}
				});
			})
		},
		full_name : (parent, args, ctx) => {
			return `${parent.first_name} ${parent.last_name}`;
		},
		metas: (parent, { type }) => {
			let where = {};

			if (type) {
				where = { where: { meta_type: type } }
			}

			return parent.getMetas(where);
		},
		companies: (parent, {filter}, ctx) => {
			let where = {active: true};
			if (filter && filter.showInactive) delete where.active;

			if (parent.role == 'master')
				return Companies.findAll();

			return parent.getCompanies({where, through:{where:{active:true}}});
		},
		company:(parent, {company_id}, ctx) => {
			return parent.getCompanies({where:{id:company_id}})
				.then (([company])=>{
					if (!company) throw new Error('Empresa não encontrada');

					return company;
				})
		},
		branch_relation: (parent, args, ctx) => {
			if (!parent.branches_users) throw new Error('Nenhum usuário selecionado');
			
			return parent.branches_users.getRole()
				.then(role => {
					return {
						role,
						active:parent.branches_users.active
					}
				})
		},
		orders: (parent) => {
			return parent.getOrders();
		},
	}
}