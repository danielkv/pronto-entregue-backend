import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type OrderOptions {
		id: ID!
		name: String!
		price: Float!
		optionRelated: Option!
	}
`;

export const resolvers =  {
	OrderOptions: {
		optionRelated: (parent) => {
			return parent.getOptionRelated();
		},
	}
}