import { gql }  from 'apollo-server';
import { Op, literal, where } from 'sequelize';

import CompanyController from '../controller/company';
import { upload }  from '../controller/uploads';
import Company from '../model/company';
import CompanyType from '../model/companyType';
import Product from '../model/product';
import { sanitizeFilter, getSQLPagination } from '../utilities';
import { CompanyAreaSelect } from '../utilities/address';

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

			const createdType = await CompanyType.create(data);

			return createdType;
		},
		async updateCompanyType(_, { id, data }) {
			if (data.file) {
				data.image = await upload('company_types', await data.file);
			}

			// check id category exists
			const type = await CompanyType.findByPk(id);
			if (!type) throw new Error('Tipo não encontrado');

			const updatedType = await type.update(data, { fields: ['name', 'description', 'image', 'active'] });

			return updatedType
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
				where: { active: true },
				include: [{
					model: Company,
					where: [{
						[Op.or]: [
							where(literal(CompanyAreaSelect('typePickUp', location, '`companies`.`id`')), '>', 0),
							where(literal(CompanyAreaSelect('typeDelivery', location, '`companies`.`id`')), '>', 0)
						]
					}, { active: true, published: true }],
					
					required: true,
					include: [
						{
							model: Product,
							where: { active: true },
							required: true,
						}
					],
				}],
				
				order: literal('RAND()'),
				group: 'companyType.id',
				limit
			})
		}
	},
	CompanyType: {
		// deprecated
		companies(parent, { location, onlyPublished=true }) {
			const where = { active: true, companyTypeId: parent.get('id') }
			if (onlyPublished === true) where.published = true;

			CompanyController.queryLoader.load({ id: 1, location: ['a', 'b'] })

			return CompanyController.getCompanies(where, location)
		},
		
		countCompanies(parent, { onlyPublished=true }) {
			const where = { active: true }
			if (onlyPublished === true) where.published = true;

			return parent.countCompanies({ where });
		}
	}
}