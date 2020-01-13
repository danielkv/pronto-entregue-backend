import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type OrderOption {
		id:ID!
		name:String!
		price:Float!
		option_related:Option!
		item_related:Item!
	}
`;

export const resolvers =  {
	OrderOption: {
		option_related : (parent) => {
			return parent.getOptionRelated();
		},
		item_related: (parent) => {
			return parent.getItemRelated();
		},
	}
}