import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type OrderProduct {
		id: ID!
		name: String!
		quantity: Int!
		price: Float!
		message: String!
		productRelated: Product!
		optionsGroups: [OrderOptionsGroup]!
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
	}
}