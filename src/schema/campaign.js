import { gql }  from 'apollo-server';

import { upload } from '../controller/uploads';
import Campaign from '../model/campaign';
import Company from '../model/company';
import Product from '../model/product';
import User from '../model/user';
import connection from '../services/connection';
import { sanitizeFilter, getSQLPagination } from '../utilities';

export const typeDefs =  gql`
	
	type Campaign {
		id: ID!
		name: String!
		image: String!
		description: String

		masterOnly: Boolean!
		chargeCompany: Boolean!
		acceptOtherCampaign: Boolean!
		active: Boolean!
		type: Type!
		valueType: ValueType!
		value: Float!

		startsAt: DateTime!
		expiresAt: DateTime!
		createdAt: DateTime!
		updatedAt: DateTime!

		products: [Product]!
		companies: [Company]!
		users: [User]!
	}

	input CampaignInput {
		name: String
		file: Upload
		description: String

		chargeCompany: Boolean
		acceptOtherCampaign: Boolean
		active: Boolean
		type: Type
		valueType: ValueType
		value: Float
		startsAt: DateTime
		expiresAt: DateTime

		companies: [ID]
		products: [ID]
		users: [ID]
	}

	extend type Query {
		countCampaigns(filter: Filter): Int!
		campaigns(filter: Filter, pagination: Pagination): [Campaign]!
		campaign(id: ID!): Campaign!
	}

	extend type Mutation {
		createCampaign(data: CampaignInput!): Campaign!
		updateCampaign(id: ID!, data: CampaignInput!): Campaign!
	}
`;

export const resolvers = {
	Mutation: {
		createCampaign(_, { data }, { user, company }) {
			return connection.transaction(async transaction => {
				// if needs to upload a file
				if (data.file) data.image = await upload('campaigns', await data.file);

				// check if user is master, if true only user master can edit
				if (user.can('master')) data.masterOnly = true;
				else {
					// if user is not master, the campaign will be charged from company
					data.chargeCompany = true;

					// if user is not master, the company has to be selected
					if (!data.companies.length) data.companies = [company.get('id')]
				}

				const createdCampaign = await Campaign.create(data, { transaction });

				if (data.companies) await createdCampaign.setCompanies(data.companies, { transaction });
				if (data.products) await createdCampaign.setProducts(data.products, { transaction });
				if (data.users) await createdCampaign.setUsers(data.users, { transaction });

				return createdCampaign;
			});
		},
		updateCampaign(_, { id, data }, { user, company }) {
			return connection.transaction(async transaction => {
				// check if campaign exists
				const campaignFound = await Campaign.findByPk(id);
				if (!campaignFound) throw new Error('Campanha não encontrado');

				// check if user can update campaign
				if (campaignFound.get('masterOnly') === true && !user.can('master')) throw new Error('Você não tem permissões para alterar essa campanha');

				// if needs to upload a file
				if (data.file) data.image = await upload('campaigns', await data.file);

				// check if user is master, if true only user master can edit
				if (user.can('master')) data.masterOnly = true;
				else {
					// if user is not master, the campaign will be charged from company
					data.chargeCompany = true;

					// if user is not master, the company has to be selected
					if (!data.companies.length) data.companies = [company.get('id')]
				}

				const updatedCampaign = await campaignFound.update(data, { fields: ['name', 'image', 'description', 'active', 'type', 'valueType', 'value', 'startsAt', 'expiresAt', 'masterOnly', 'acceptOtherCampaign', 'chargeCompany'], transaction });

				if (data.companies) await updatedCampaign.setCompanies(data.companies, { transaction });
				if (data.products) await updatedCampaign.setProducts(data.products, { transaction });
				if (data.users) await updatedCampaign.setUsers(data.users, { transaction });

				return updatedCampaign;
			});
		}
	},
	Query: {
		async campaign(_, { id }) {
			// check if campaign exists
			const campaignFound = await Campaign.findByPk(id);
			if (!campaignFound) throw new Error('Campanha não encontrado');

			return campaignFound;
		},
		countCampaigns(_, { filter }) {
			const where = sanitizeFilter(filter, { search: ['name', 'description', '$company.name$', '$user.firstName$', '$product.name$'] });

			return Campaign.count({
				where,
				include: [Company, User, Product]
			})
		},
		campaigns(_, { filter, pagination }) {
			const where = sanitizeFilter(filter, { search: ['name', 'description', '$company.name$', '$user.firstName$', '$product.name$'] });

			return Campaign.findAll({
				where,
				order: [['expiresAt', 'DESC'], ['createdAt', 'Desc']],
				include: [Company, User, Product],
				...getSQLPagination(pagination),
			})
		}
	},
	Campaign: {
		products(parent) {
			return parent.getProducts();
		},
		companies(parent) {
			return parent.getCompanies();
		},
		users(parent) {
			return parent.getUsers();
		},
	}
}