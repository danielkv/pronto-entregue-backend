import { gql }  from 'apollo-server';

import CompanyController from '../controller/company';

export const typeDefs =  gql`
	extend type Company {
		config(keys:String!): JSON
		configs(keys:[String!]!): JSON
	}
`;

export const resolvers =  {
	Company: {
		config(parent, { key }) {
			const companyId = parent.get('id');
			
			return CompanyController.getConfig(companyId, key);
		},
		async configs(parent, { keys }) {
			const companyId = parent.get('id');

			const configs = await Promise.all(keys.map(key=>CompanyController.getConfig(companyId, key)));
			const configCollection = {};

			for (let i=0; i<configs.length; i++) {
				const value = configs[i];
				const key = keys[i];
				configCollection[key] = value
			}

			return configCollection;
		}
	}
}