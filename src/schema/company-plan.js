import { gql }  from 'apollo-server';

import { planLoader } from '../loaders';

export const typeDefs =  gql`
	type CompanyPlan {
		type: String!
		value: Float!
		valueType: String!
		ordersLimit: Int!
		exceeded: Float!
	}
	
	extend type Company {
		plan: CompanyPlan @hasRole(permission: "companies_read")
	}
`;

export const resolvers =  {
	Company: {
		plan(parent) {
			const companyId = parent.get('id')

			return planLoader.load(companyId)
		}
	}
}