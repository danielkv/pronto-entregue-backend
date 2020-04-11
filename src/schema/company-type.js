import { gql }  from 'apollo-server';
import { Op, literal } from 'sequelize';

import { upload }  from '../controller/uploads';
import Address from '../model/address';
import Company from '../model/company';
import CompanyType from '../model/companyType';
import { sanitizeFilter, getSQLPagination } from '../utilities';
import { whereCompanyDistance } from '../utilities/address';

export const typeDefs =  gql`
	type CompanyType {
		id: ID!
		name: String!
		description: String
		active: Boolean!
		image: String!
		createdAt: DateTime!
		updatedAt: DateTime!

		countCompanies(onlyPublished: Boolean): Int!
		companies(location: GeoPoint, onlyPublished: Boolean): [Company]!
	}

	input CompanyTypeInput {
		id: ID
		name: String
		description: String
		file: Upload
		active: Boolean
	}

	extend type Query {
		companyType(id: ID): CompanyType!
		countCompanyTypes(filter: Filter): Int! @hasRole(permission: "master")
		companyTypes(filter: Filter, pagination: Pagination): [CompanyType]! @hasRole(permission: "master")
		
		#section in App
		sections(limit: Int, location: GeoPoint!): [CompanyType]!
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
		},
		/**
		 * CompanyTypes on APP
		 * DEVE SER USADO APENAS NO APP
		 */
		sections(_, { limit = 8, location }) {
			return CompanyType.findAll({
				where: whereCompanyDistance(location, 'companies'),
				include: [{
					model: Company,
					where: { active: true, published: true },
					required: true,
					include: [{
						model: Address,
						required: true,
					}],
				}],
				subQuery: false,
				order: literal('RAND()'),
				limit
			})
		}
	},
	CompanyType: {
		companies(parent, { location, onlyPublished=true }) {
			if (!location) return parent.getCompanies();

			return parent.getCompanies({
				where: {
					[Op.and]: [
						whereCompanyDistance(location, 'company', 'address.location'),
						{ active: true, published: onlyPublished }
					],
				},
				include: [{
					model: Address,
					required: true,
				}]
			});
		},
		countCompanies(parent, { onlyPublished }) {
			return parent.countCompanies({ where: { published: onlyPublished } });
		}
	}
}