import { gql }  from 'apollo-server';
import { defaultBusinessHours } from '../utilities/company';

export const typeDefs =  gql`

	type BusinessTime {
		from:String
		to:String
	}
	type BusinessHour {
		dayOfWeek:String!
		hours:[BusinessTime]!
	}
	input BusinessTimeInput {
		from:String
		to:String
	}

	input BusinessHourInput {
		dayOfWeek:String!
		hours:[BusinessTimeInput!]!
	}

	extend type Mutation {
		updateBusinessHours(data: [BusinessHourInput]!): [BusinessHour]! @hasRole(permission:"company_edit", scope:"adm")
	}

`;

export const resolvers = {
	Mutation: {
		async updateBusinessHours(_, { data }, { company }) {
			// check if meta exists
			const [meta] = await company.getMetas({ where: { key: 'businessHours' } })
		
			// stringfy meta json
			const value = JSON.stringify(data);

			// create meta
			if (!meta) await company.createMeta({ key: 'businessHours', value });
			// update meta
			else await meta.update({ value });
			
			return data;
		},
	}
}