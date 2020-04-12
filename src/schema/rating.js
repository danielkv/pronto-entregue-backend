import { gql }  from 'apollo-server';

import Rating from '../model/rating';
import User from '../model/user';
import { sanitizeFilter, getSQLPagination } from '../utilities';


export const typeDefs =  gql`
	
	type Rating {
		id: ID!
		rate: Int!
		comment: String!
		hidden: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!

		company: Company!
		user: User!
		order: Order!
	}

	input RatingInput {
		id: ID
		rate: Int
		comment: String
		hidden: Boolean

		orderId: ID
	}

	extend type Query {
		countRatings(filter: Filter): Int!
		ratings(filter: Filter, pagination: Pagination): [Rating]!
		rating(id: ID!): Rating! @hasRole(permission: "adm")
	}

	extend type Mutation {
		createRating(data: RatingInput!): Rating! @isAuthenticated
		updateRating(id: ID!, data: RatingInput!): Rating! @hasRole(permission: "adm")
	}
`;

export const resolvers = {
	Mutation: {
		createRating(_, { data }, { user, company }) {
			// set related data
			data.companyId = company.get('id');
			data.userId = user.get('id');

			// create rating
			return Rating.create(data);
		},
		async updateRating(_, { id, data }) {
			// check if campaign exists
			const ratingFound = await Rating.findByPk(id);
			if (!ratingFound) throw new Error('Avaliação não encontrado');

			return ratingFound.update(data, { fields: ['hidden'] });
		}
	},
	Query: {
		async rating(_, { id }) {
			// check if campaign exists
			const ratingFound = await Rating.findByPk(id);
			if (!ratingFound) throw new Error('Avaliação não encontrado');

			return ratingFound;
		},
		ratings(_, { filter, pagination }) {
			const _filter = sanitizeFilter(filter, { excludeFilters: ['active'], search: ['comment', '$user.firstName$', '$user.email$'] });

			return Rating.findAll({
				where: _filter,
				order: [['createdAt', 'Desc']],
				...getSQLPagination(pagination),

				include: [User]
			})
		},
		countRatings(_, { filter }) {
			const where = sanitizeFilter(filter, { excludeFilters: ['active'], search: ['comment', '$user.firstName$', '$user.email$'] });

			return Rating.count({ where, include: [User] });
		},
	},
	Rating: {
		company(parent) {
			return parent.getCompanies();
		},
		user(parent) {
			return parent.getUser();
		},
		order(parent) {
			return parent.getOrder();
		}
	}
}