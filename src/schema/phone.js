import { gql }  from 'apollo-server';

export const typeDefs =  gql`

	type Phone {
		id: ID!
		number: String!
	}	

`;

export const resolvers =  {
	
}