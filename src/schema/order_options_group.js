import { gql }  from 'apollo-server';

import { orderOptionsLoader } from '../loaders';

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
			const groupId = parent.get('id');
			return orderOptionsLoader.load(groupId)
		},
		optionsGroupRelated: (parent) => {
			return parent.getOptionsGroupRelated();
		}
	}
}