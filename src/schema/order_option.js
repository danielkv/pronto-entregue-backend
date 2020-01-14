import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type OrderOption {
		id: ID!
		name: String!
		price: Float!
		optionRelated: Option!
	}
`;

export const resolvers =  {
	OrderOption: {
		optionRelated: (parent) => {
			return parent.getOptionRelated();
		},
	}
}