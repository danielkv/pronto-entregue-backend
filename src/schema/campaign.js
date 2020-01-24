import { gql }  from 'apollo-server';

import { upload } from '../controller/uploads';
import Campaign from '../model/campaign';
import connection from '../services/connection';
import { sanitizeFilter, getSQLPagination } from '../utilities';

export const typeDefs =  gql`
	
	type Campaign {
		id: ID!
		name: String!
		image: String!
		description: String

		chargeCompany: Boolean!
		acceptOtherCompaign: Boolean!
		active: Boolean!
		type: Type!
		valueType: ValueType!
		value: Float!

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
		acceptOtherCompaign: Boolean
		active: Boolean
		type: Type
		valueType: ValueType
		value: Float
		expiresAt: DateTime

		companies: [ID]
		products: [ID]
		users: [ID]
	}

	extend type Query {
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
		createCampaign(_, { data }) {
			return connection.transaction(async transaction => {
				// if needs to upload a file
				if (data.file) data.image = await upload('campaigns', await data.file);

				const createdCampaign = await Campaign.create(data, { transaction });

				if (data.companies) await createdCampaign.setCompanies(data.companies, { transaction });
				if (data.products) await createdCampaign.setProducts(data.products, { transaction });
				if (data.users) await createdCampaign.setUsers(data.users, { transaction });

				return createdCampaign;
			});
		},
		updateCampaign(_, { id, data }) {
			return connection.transaction(async transaction => {
				// check if campaign exists
				const campaignFound = await Campaign.findByPk(id);
				if (!campaignFound) throw new Error('Campanha não encontrado');

				// if needs to upload a file
				if (data.file) data.image = await upload('campaigns', await data.file);

				const updatedCampaign = await campaignFound.update(data, { fields: ['name', 'image', 'description', 'active', 'type', 'valueType', 'value', 'expiresAt'], transaction });

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
		campaigns(_, { filter, pagination }) {
			const where = sanitizeFilter(filter, { search: ['name', 'description'] });

			return Campaign.findAll({
				where,
				order: [['expiresAt', 'DESC'], ['createdAt', 'Desc']],
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