import { gql }  from 'apollo-server';

import { upload }  from '../controller/uploads';
import CompanyType from '../model/companyType';
import { sanitizeFilter, getSQLPagination } from '../utilities';

export const typeDefs =  gql`
	type CompanyType {
		id: ID!
		name: String!
		description: String
		active: Boolean!
		image: String!
		createdAt: DateTime!
		updatedAt: DateTime!

		countCompanies: Int!
		companies: [Company]!
	}

	input CompanyTypeInput {
		id: ID
		name: String
		description: String
		file: Upload
		active: Boolean
	}

	extend type Query {
		companyType(id: ID): CompanyType! @hasRole(permission: "master")
		countCompanyTypes(filter: Filter): Int! @hasRole(permission: "master")
		companyTypes(filter: Filter, pagination: Pagination): [CompanyType]! @hasRole(permission: "master")
	}

	extend type Mutation {
		createCompanyType(data: CompanyTypeInput!): CompanyType! @hasRole(permission: "master")
		updateCompanyType(id: ID!, data: CompanyTypeInput!): CompanyType! @hasRole(permission: "master")
		
		searchCompanyTypes(search: String!): [CompanyType]! @hasRole(permission: "master")
	}
`;

export const resolvers =  {
	Mutation: {
		async createCompanyType(_, { data }) {
			if (data.file) {
				data.image = await upload('company_types', await data.file);
			}

			return CompanyType.create(data);
		},
		async updateCompanyType(_, { id, data }) {
			if (data.file) {
				data.image = await upload('company_types', await data.file);
			}

			// check id category exists
			const type = await CompanyType.findByPk(id);
			if (!type) throw new Error('Tipo não encontrado');

			return type.update(data, { fields: ['name', 'description', 'image', 'active'] });
		},
		searchCompanyTypes(_, { search }) {
			const where = sanitizeFilter({ search }, { search: ['name', 'description'] });

			return CompanyType.findAll({
				where,
				order: [['name', 'ASC']]
			})
		}
	},
	Query: {
		companyType(_, { id }) {
			return CompanyType.findByPk(id);
		},
		countCompanyTypes(_, { filter }) {
			const where = sanitizeFilter(filter);

			return CompanyType.count({ where })
		},
		companyTypes(_, { filter, pagination }) {
			const where = sanitizeFilter(filter);

			return CompanyType.findAll({
				where,
				...getSQLPagination(pagination),
			})
		}
	},
	CompanyType: {
		companies(parent) {
			return parent.getCompanies();
		},
		countCompanies(parent) {
			return parent.countCompanies();
		}
	}
}