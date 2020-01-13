import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type OrderProduct {
		id: ID!
		name: String!
		quantity: Int!
		price: Float!
		message: String!
		product_related: Product!
		options_groups: [OrderOptionsGroup]!
	}
`;

export const resolvers =  {
	OrderProduct: {
		options_groups : (parent) => {
			return parent.getOptionsGroups();
		},
		product_related : (parent) => {
			return parent.getProductRelated();
		},
	}
}