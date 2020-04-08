import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type OrderOptions {
		id: ID!
		name: String!
		description: String
		price: Float!
		optionRelated: Option!
	}

	input OrderOptionInput {
		id: ID
		name: String!
		description: String
		price: Float!
		optionRelatedId: ID!
	}
`;

export const resolvers =  {
	OrderOptions: {
		optionRelated: (parent) => {
			return parent.getOptionRelated();
		},
	}
}