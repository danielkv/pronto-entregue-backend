import { gql }  from 'apollo-server';

export const typeDefs =  gql`
	type Option {
		id:ID!
		name:String!
		order:Int!
		active:Boolean!
		price:Float!
		createdAt:String!
		updatedAt:String!
		max_select_restrain_other:Int
		item:Item
	}
`;

export const resolvers =  {
	Option: {
		item: (parent) => {
			return parent.getItem();
		},
	}
}