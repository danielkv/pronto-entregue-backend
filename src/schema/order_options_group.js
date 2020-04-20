import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type OrderOptionsGroup {
		id: ID!
		name: String!
		priceType: String!
		optionsGroupRelated: OptionsGroup!
		options: [OrderOptions]!
	}
	input OrderOptionsGroupInput {
		id: ID
		name: String!
		priceType: String
		optionsGroupRelatedId: ID!
		
		options: [OrderOptionInput!]
	}
`;

export const resolvers =  {
	OrderOptionsGroup: {
		options: (parent) => {
			return parent.getOptions();
		},
		optionsGroupRelated: (parent) => {
			return parent.getOptionsGroupRelated();
		}
	}
}