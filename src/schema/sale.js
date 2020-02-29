import { gql }  from 'apollo-server';

import Sale from '../model/sale';

export const typeDefs =  gql`

	type Sale {
		id: ID!
		startsAt: DateTime!
		expiresAt: DateTime!
		createdAt: DateTime!
		updatedAt: DateTime!

		progress: Boolean!

		price: Float!
		active: Boolean!
	}

	input SaleInput {
		startsAt: DateTime
		expiresAt: DateTime

		price: Float
		active: Boolean

		action: action
	}
	
	enum action {
		create
		delete
	}	

	extend type Mutation {
		removeSale(id: ID!): Sale!
	}

`;

export const resolvers =  {
	Mutation: {
		async removeSale(_, { id }) {
			// checks if sale exists
			const sale = await Sale.findByPk(id)
			if (!sale) throw new Error('Promoção não encontrada');

			await sale.update({ removed: true });

			return sale;
		}
	},
	Sale: {
		progress(parent) {
			return parent.get('progress')
		}
	}
}