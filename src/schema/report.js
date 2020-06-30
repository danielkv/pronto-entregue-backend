import { gql }  from 'apollo-server';
import moment from 'moment';

import CompaniesReportController from '../controller/companiesReport';
import Company from '../model/company';
import CompanyMeta from '../model/companyMeta';
import Coupon from '../model/coupon';
import CreditHistory from '../model/creditHistory';
import Order from '../model/order';
import { sanitizeFilter } from '../utilities';

export const typeDefs =  gql`
	
	type CompaniesReport {
		companies: [CompanyReport]!
		
		credits: Float!
		coupons: Float!
		taxableCoupon: Float!

		companyDiscount: Float!
		totalDiscount: Float!
		revenue: Float!
		tax: Float!
		taxable: Float!
		countOrders: Int!
	}

	type CompanyReport {
		id: ID!
		displayName: String!
		plan: CompanyPlan!

		countOrders: Int!
		orders: [OrderReport]!

		credits: Float!
		coupons: Float!
		taxableCoupon: Float!

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

		datetime: String!

		creditHistory: CreditHistory
		coupon: Coupon
		couponValue: Float!
		taxableCoupon: Float!
		
		tax: Float!
		taxable: Float!
	}

	extend type Query {
		companiesReport(companiesIds: [ID], filter: JSON): CompaniesReport!
	}

`;

export const resolvers =  {
	Query: {
		async companiesReport(_, { companiesIds=null, filter }) {
			const ordersWhere = filter ? sanitizeFilter(filter, { excludeFilters: ['active'] }) : null;
			const companyWhere = companiesIds ? { id: companiesIds } : null;

			const companies = await Company.findAll({
				where: companyWhere,
				include: [
					{
						model: Order,
						required: true,
						where: ordersWhere,
						subQuery: true,
						include: [CreditHistory, Coupon]
					},
					{
						model: CompanyMeta,
						required: false,
						where: { key: 'plan' }
					}
				]
			})

			return CompaniesReportController.calculate(companies);
		}
	},
	CompaniesReport: {
		countOrders(parent) {
			return parent.companies.reduce((value, company)=>{
				return company.orders.length + value
			}, 0)
		}
	},
	CompanyReport: {
		countOrders(parent) {
			return parent.orders.length
		}
	},
	OrderReport: {
		datetime(parent){
			return moment(parent.createdAt).format()
		}
	}
}