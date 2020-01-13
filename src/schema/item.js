import { gql }  from 'apollo-server';

import Items  from '../model/items';

export const typeDefs =  gql`
	type Item {
		id:ID!
		name:String!
		description:String!
		active:Boolean!
		createdAt:String! @dateTime
		updatedAt:String! @dateTime
		order_options:[OrderOption]!
	}

	type ItemsList {
		count: Int!
		rows: [Item]!
	}

	input ItemInput {
		name:String
		description:String
		active:Boolean
	}

	extend type Query {
		item(id:ID!): Item!
	}

	extend type Mutation {
		updateItem(id:ID!, data:ItemInput): Item!
		createItem(data:ItemInput!): Item!
	}
`;

export const resolvers =  {
	Query : {
		item : (_, { id }) => {
			return Items.findByPk(id);
		},
	},
	Mutation: {
		createItem : (_, { data }, ctx) => {
			return ctx.company.createItem(data);
		},
		updateItem : (_, { id, data }) => {
			return Items.findByPk(id)
				.then(item =>{
					return item.update(data, { fields:['name', 'description', 'active'] });
				});
		},
	},
	Item: {
		order_options: () => {

		},
	}
}