import { gql }  from 'apollo-server';

import { upload } from '../controller/uploads';
import Campaign from '../model/campaign';
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
		image: String
		description: String
		active: Boolean
		type: Type
		valueType: ValueType
		value: Float
		expiresAt: Int
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
		async createCampaign(_, { data }) {
			// if needs to upload a file
			if (data.file) data.image = await upload('campaigns', await data.file);

			return Campaign.create(data);
		},
		async updateCampaign(_, { id, data }) {
			// check if campaign exists
			const campaignFound = await Campaign.findByPk(id);
			if (!campaignFound) throw new Error('Campanha não encontrado');

			// if needs to upload a file
			if (data.file) data.image = await upload('campaigns', await data.file);

			return campaignFound.update(data, { fields: ['name', 'image', 'description', 'active', 'type', 'valueType', 'value', 'expiresAt'] });
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
			const _filter = sanitizeFilter(filter, { search: ['name', 'description'] });

			return Campaign.findAll({
				where: _filter,
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