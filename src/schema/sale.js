import { gql }  from 'apollo-server';

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
	}

`;

export const resolvers =  {
	Sale: {
		progress(parent) {
			return parent.get('progress')
		}
	}
}