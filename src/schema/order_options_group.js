import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type OrderOptionsGroup {
		id: ID!
		name: String!
		optionsGroupRelated: OptionsGroup!
		options: [OrderOptions]!
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