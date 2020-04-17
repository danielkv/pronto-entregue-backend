import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type OrderProduct {
		id: ID!
		name: String!
		image: String!
		quantity: Int!
		price: Float!
		message: String!
		productRelated: Product!
		optionsGroups: [OrderOptionsGroup]!
	}
	
	input OrderProductInput {
		id: ID
		action: String
		quantity: Int
		name: String
		price: Float
		message: String
		productRelatedId: ID
		optionsGroups: [OrderOptionsGroupInput!]
	}
`;

export const resolvers =  {
	OrderProduct: {
		optionsGroups(parent) {
			return parent.getOptionsGroups();
		},
		productRelated(parent) {
			return parent.getProductRelated();
		},
		image(parent) {
			if (parent.productRelated) return parent.productRelated.get('image');

			return parent.getProductRelated()
				.then((product) => {
					return product.get('image')
				})
		}
	}
}