import { gql }  from 'apollo-server';

import Companies  from '../model/company';
import CompaniesMeta  from '../model/companyMeta';
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

		countUsers(filter: Filter): Int! @hasRole(permission: "users_read", scope: "adm")
		users(filter: Filter, pagination: Pagination): [User]! @hasRole(permission: "users_read", scope: "adm")
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