import { gql }  from 'apollo-server';

import Rating from '../model/rating';
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
	}

	input RatingInput {
		id: ID
		rate: Int
		comment: String
		hidden: Boolean

		userId: ID
		productId: ID
	}

	extend type Query {
		ratings(filter: Filter, pagination: Pagination): [Rating]!
		rating(id: ID!): Rating!
	}

	extend type Mutation {
		createRating(data: RatingInput!): Rating!
		updateRating(id: ID!, data: RatingInput!): Rating!
	}
`;

export const resolvers = {
	Mutation: {
		createRating(_, { data }) {
			return Rating.create(data);
		},
		async updateRating(_, { id, data }) {
			// check if campaign exists
			const ratingFound = await Rating.findByPk(id);
			if (!ratingFound) throw new Error('Avaliação não encontrado');

			return ratingFound.update(data, { fields: ['rate', 'comment', 'hidden'] });
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
			const _filter = sanitizeFilter(filter, { search: ['comment'] });

			return Rating.findAll({
				where: _filter,
				order: [['createdAt', 'Desc']],
				...getSQLPagination(pagination),
			})
		}
	},
	Rating: {
		company(parent) {
			return parent.getCompanies();
		},
		user(parent) {
			return parent.getUser();
		}
	}
}