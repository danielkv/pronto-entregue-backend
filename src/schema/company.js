import { gql }  from 'apollo-server';

import Companies  from '../model/company';
import CompaniesMeta  from '../model/companyMeta';
import Users  from '../model/user';
import sequelize  from '../services/connection';
import { getSQLPagination, sanitizeFilter }  from '../utilities';

export const typeDefs =  gql`

	type Company {
		id: ID!
		name: String!
		displayName: String!
		active: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!
		metas: [Meta]!
		lastMonthRevenue: Float!
		userRelation: CompanyRelation!

		assignedBranches: [Branch]! @hasRole(permission: "users_edit", scope: "adm")

		countUsers(filter: Filter): Int! @hasRole(permission: "users_read", scope: "adm")
		users(filter: Filter, pagination: Pagination): [User]! @hasRole(permission: "users_read", scope: "adm")
		
		countBranches(filter: Filter): Int!
		branches(filter: Filter, pagination: Pagination): [Branch]!
	}
	

	input CompanyInput {
		name: String
		displayName: String
		active: Boolean
		metas: [MetaInput]
	}

	extend type Mutation {
		createCompany(data: CompanyInput!): Company! @hasRole(permission: "companies_edit", scope: "adm")
		updateCompany(id: ID!, data: CompanyInput!): Company! @hasRole(permission: "companies_edit", scope: "adm")
	}

	extend type Query {
		company(id: ID!): Company!
		userCompanies: [Company!] @hasRole(permission: "companies_read", scope: "adm")
	}
`;

export const resolvers =  {
	Mutation: {
		createCompany: (_, { data }) => {
			return sequelize.transaction(transaction => {
				return Companies.create(data, { include: [CompaniesMeta], transaction })
			})
		},
		updateCompany: (_, { id, data }) => {
			return sequelize.transaction(transaction => {
				return Companies.findByPk(id)
					.then(company=>{
						if (!company) throw new Error('Empresa não encontrada');

						return company.update(data, { fields: ['name', 'displayName', 'active'], transaction })
					})
					.then(async (companyUpdated) => {
						if (data.metas) {
							await CompaniesMeta.updateAll(data.metas, companyUpdated, transaction);
						}
						return companyUpdated;
					})
			})
		}
	},
	Query: {
		companies: () => {
			return Companies.findAll();
		},
		userCompanies: (_, __, ctx) => {
			if (ctx.user.can('master'))
				return Companies.findAll();

			return ctx.user.getCompanies({ through: { where: { active: true } } });
		},
		company: (_, { id }) => {
			return Companies.findByPk(id)
				.then(company => {
					if (!company) throw new Error('Empresa não encontrada');

					return company;
				});
		}
	},
	Company: {
		userRelation: (parent) => {
			if (!parent.companyRelation) throw new Error('Nenhum usuário selecionado');

			return parent.companyRelation.get();
		},
		assignedBranches: (parent) => {
			if (!parent.companyRelation) throw new Error('Nenhum usuário selecionado');
			
			return parent.getUsers({ where: { id: parent.companyRelation.userId } })
				.then(([user])=>{
					if (!user) throw new Error('Usuário não encontrado');

					return user.getBranches({ where: { companyId: parent.get('id') } });
				})
		},
		branches: (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter, { search: ['name'] });

			if (!parent.companyRelation) return parent.getBranches({
				where: _filter,
				...getSQLPagination(pagination),
			});
			
			return Users.findByPk(parent.companyRelation.get('userId'))
				.then(user=>{
				//se Usuário for master pode buscar todas as filiais mesmo desativadas
					if (user.get('role') === 'master') return parent.getBranches({
						where: { ..._filter, companyId: parent.get('id') },
						...getSQLPagination(pagination),
					});
				
					//se Usuário for adm pode buscar todas as filiais ativas
					if (user.get('role') === 'adm') return parent.getBranches({
						where: { ..._filter, companyId: parent.get('id') },
						...getSQLPagination(pagination),
					});

					//caso chegue aqui usuário verá a lista de filiais que estão ativas e estão vinculadas a ele
					return user.getBranches({
						where: {
							..._filter,
							companyId: parent.get('id')
						},
						...getSQLPagination(pagination),

						through: { where: { active: true } }
					})
				});
		},
		countUsers: (parent, { filter }) => {
			const _filter = sanitizeFilter(filter, { search: ['firstName', 'lastName', 'email'] });

			return parent.countUsers({ where: _filter });
		},
		users: (parent, { filter, pagination }) => {
			const _filter = sanitizeFilter(filter, { search: ['firstName', 'lastName', 'email'] });

			return parent.getUsers({
				where: _filter,
				order: [['firstName', 'ASC'], ['lastName', 'ASC']],
				...getSQLPagination(pagination),
			});
		},
		metas: (parent) => {
			return parent.getMetas();
		},
		lastMonthRevenue: () => {
			return 0;
		},
	}
}