const { gql } = require('apollo-server');

const sequelize = require('../services/connection');
const Companies = require('../model/companies');
const CompaniesMeta = require('../model/companies_meta');
const Items = require('../model/items');
const Users = require('../model/users');
const { getSQLPagination, sanitizeFilter } = require('../utilities');

module.exports.typeDefs = gql`
	type CompanyMeta {
		id:ID!
		meta_type:String!
		meta_value:String!
		createdAt:String! @dateTime
	}

	type Company {
		id:ID!
		name:String!
		display_name:String!
		active:Boolean!
		createdAt:String! @dateTime
		updatedAt:String! @dateTime
		metas:[CompanyMeta]!
		last_month_revenue:Float!
		user_relation: CompanyRelation!

		assigned_branches: [Branch]! @hasRole(permission:"users_edit", scope:"adm")

		countUsers(filter:Filter): Int! @hasRole(permission:"users_read", scope:"adm")
		users(filter:Filter, pagination: Pagination): [User]! @hasRole(permission:"users_read", scope:"adm")
		
		countBranches(filter:Filter): Int!
		branches(filter:Filter, pagination: Pagination): [Branch]!
		countItems(filter: Filter): Int!
		items(filter:Filter, pagination: Pagination): [Item]!
	}
	
	input CompanyMetaInput {
		id:ID
		action:String! #create | update | delete
		meta_type:String
		meta_value:String
	}

	input CompanyInput {
		name:String
		display_name:String
		active:Boolean
		metas:[CompanyMetaInput]
	}

	extend type Mutation {
		createCompany(data:CompanyInput!):Company! @hasRole(permission:"companies_edit", scope:"adm")
		updateCompany(id:ID!, data:CompanyInput!):Company! @hasRole(permission:"companies_edit", scope:"adm")
	}

	extend type Query {
		company(id:ID!): Company!
		userCompanies: [Company!] @hasRole(permission:"companies_read", scope:"adm")
	}
`;

module.exports.resolvers = {
	Mutation : {
		createCompany: (parent, {data}, ctx) => {
			return sequelize.transaction(transaction => {
				return Companies.create(data, {include:[CompaniesMeta], transaction})
			})
		},
		updateCompany: (parent, {id, data}, ctx) => {
			return sequelize.transaction(transaction => {
				return Companies.findByPk(id)
				.then(company=>{
					if (!company) throw new Error('Empresa não encontrada');

					return company.update(data, { fields: ['name', 'display_name', 'active'], transaction })
				})
				.then(async (company_updated) => {
					if (data.metas) {
						await CompaniesMeta.updateAll(data.metas, company_updated, transaction);
					}
					return company_updated;
				})
			})
		}
	},
	Query : {
		companies: (parent, args, ctx) => {
			return Companies.findAll();
		},
		userCompanies: (parent, args, ctx) => {
			if (ctx.user.can('master'))
				return Companies.findAll();

			return ctx.user.getCompanies({through:{where:{active:true}}});
		},
		company:(_, { id }, ctx) => {
			return Companies.findByPk(id)
			.then(company => {
				if (!company) throw new Error('Empresa não encontrada');

				return company;
			});
		}
	},
	Company: {
		countItems : (parent, { filter }) => {
			const _filter = sanitizeFilter(filter);

			return parent.countItems({ where: _filter })
		},
		items : (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter);

			return parent.getItems({
				where: _filter,
				...getSQLPagination(pagination),
			});
		},
		user_relation : (parent) => {
			if (!parent.company_relation) throw new Error('Nenhum usuário selecionado');

			return parent.company_relation.get();
		},
		assigned_branches : (parent) => {
			if (!parent.company_relation) throw new Error('Nenhum usuário selecionado');
			
			return parent.getUsers({where:{id:parent.company_relation.user_id}})
			.then(([user])=>{
				if (!user) throw new Error('Usuário não encontrado');

				return user.getBranches({ where: { company_id:parent.get('id') } });
			})
		},
		branches: (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter, { search: ['name'] });

			if (!parent.company_relation) return parent.getBranches({
				where: _filter,
				...getSQLPagination(pagination),
			});
			
			return Users.findByPk(parent.company_relation.get('user_id'))
			.then(user=>{
				//se Usuário for master pode buscar todas as filiais mesmo desativadas
				if (user.get('role') === 'master') return parent.getBranches({
					where: { ..._filter, company_id: parent.get('id') },
					...getSQLPagination(pagination),
				});
				
				//se Usuário for adm pode buscar todas as filiais ativas
				if (user.get('role') === 'adm') return parent.getBranches({
					where: { ..._filter, company_id: parent.get('id') },
					...getSQLPagination(pagination),
				});

				//caso chegue aqui usuário verá a lista de filiais que estão ativas e estão vinculadas a ele
				return user.getBranches({
					where: {
						..._filter,
						company_id: parent.get('id')
					},
					...getSQLPagination(pagination),

					through: { where: { active: true } }
				})
			});
		},
		countUsers: (parent, { filter }) => {
			const _filter = sanitizeFilter(filter, { search: ['first_name', 'last_name', 'email']});

			return parent.countUsers({ where: _filter });
		},
		users: (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter, { search: ['first_name', 'last_name', 'email']});

			return parent.getUsers({
				where: _filter,
				order: [['first_name', 'ASC'], ['last_name', 'ASC']],
				...getSQLPagination(pagination),
			});
		},
		metas: (parent) => {
			return parent.getMetas();
		},
		last_month_revenue: (parent, args, ctx) => {
			return 0;
		},
	}
}