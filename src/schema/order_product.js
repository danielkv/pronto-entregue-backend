import { gql }  from 'apollo-server';

import { orderProductsLoader } from '../loaders/order';

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

	extend type Order {
		countProducts: Int!
		products: [OrderProduct]!
	}
`;

export const resolvers =  {
	Order: {
		products(parent) {
			//return parent.getProducts();
			const orderId = parent.get('id');

			return orderProductsLoader.load(orderId);
		},
		async countProducts(parent) {
			const orderId = parent.get('id');

			const products = await orderProductsLoader.load(orderId);

			return products.length;
		},
	},
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