import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type OrderOptionsGroup {
		id:ID!
		name:String!
		options_group_related:OptionsGroup!
		options:[OrderOption]!
	}
`;

export const resolvers =  {
	OrderOptionsGroup: {
		options : (parent) => {
			return parent.getOptions();
		},
		options_group_related: (parent) => {
			return parent.getOptionsGroupRelated();
		}
	}
}