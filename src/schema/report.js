import { gql }  from 'apollo-server';

import { calculateCompanyValues } from '../controller/reports';
import Company from '../model/company';
import CompanyMeta from '../model/companyMeta';
import CreditHistory from '../model/creditHistory';
import Order from '../model/order';
import { sanitizeFilter } from '../utilities';
import { defaultPlan } from '../utilities/company';

export const typeDefs =  gql`
	
	type CompanyReport {
		id: ID!
		displayName: String!
		plan: CompanyPlan!

		orders(filter: JSON): [OrderReport]!

		usDiscount: Float!
		companyDiscount: Float!
		totalDiscount: Float!
		revenue: Float!
		tax: Float!
		taxable: Float!
	}

	type OrderReport {
		id: ID!
		createdAt: DateTime!
		subtotal: Float!
		price: Float!
		discount: Float!

		creditHistory: CreditHistory
		
		tax: Float!
		taxable: Float!
	}

	extend type Query {
		companiesReport(companiesIds: [ID]): [CompanyReport]!
	}

`;

export const resolvers =  {
	Query: {
		async companiesReport(_, { companiesIds=null, filter }) {
			const ordersWhere = filter ? sanitizeFilter(filter) : null;
			const companyWhere = companiesIds ? { id: companiesIds } : null;

			const companies = await Company.findAll({
				where: companyWhere,
				include: [
					{
						model: Order,
						required: true,
						where: ordersWhere,
						include: [CreditHistory]
					},
					{
						model: CompanyMeta,
						required: false,
						where: { key: 'plan' }
					}
				]
			})

			

			return companies.map(company => {
				const plan = company.metas.length ? JSON.parse(company.metas[0].value) : defaultPlan();
				const companyResult = calculateCompanyValues(company, plan);
				return companyResult
			})
		}
	},
	/* CompanyReport: {
		orders(parent, { filter }){
			
		}
	} */
}