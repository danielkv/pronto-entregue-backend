import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type OrderOption {
		id:ID!
		name:String!
		price:Float!
		option_related:Option!
	}
`;

export const resolvers =  {
	OrderOption: {
		option_related : (parent) => {
			return parent.getOptionRelated();
		},
	}
}