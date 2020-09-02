import { gql }  from 'apollo-server';
import Sequelize from 'sequelize';

import CompaniesReportController from '../controller/companiesReport';
import DB from '../model';
import Company from '../model/company';
import Order from '../model/order';
import { sanitizeFilter } from '../utilities';

export const typeDefs =  gql`
	
	type CompaniesReport {
		companies: [CompanyReport]!
		
		credits: Float!
		payment: Float!
		refund: Float!
		coupons: Float!
		taxableCoupon: Float!
		deliveryPaymentValue: Float!
		countPeDelivery: Int!

		companyDiscount: Float!
		totalDiscount: Float!
		revenue: Float!
		tax: Float!
		taxable: Float!
		countOrders: Int!
	}

	type CompanyReport {
		id: ID!
		image: String!
		displayName: String!
		plan: CompanyPlan
		refund: Float!
		deliveryPaymentValue: Float!
		countPeDelivery: Int!
		payment: Float!
		
		countOrders: Int!
		orders: [OrderReport]!

		credits: Float!
		coupons: Float!
		taxableCoupon: Float!

		#companyDiscount: Float!
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
		refund: Float!
		type: String!
		payment: Float!

		deliveryPrice: Float!
		deliveryPaymentValue: Float!

		discount: Float!

		creditHistory: CreditHistory

		coupon: Coupon
		couponValue: Float!
		taxableCoupon: Float!

		paymentMethod: PaymentMethod!
		
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
			const companyWhere = companiesIds && companiesIds.length ? { id: companiesIds } : null;

			const companies = await Company.findAll({
				where: companyWhere,
				include: [
					{
						model: Order,
						required: true,
						where: ordersWhere,
						subQuery: true,
						include: [DB.creditHistory, DB.coupon, DB.paymentMethod]
					},
					{
						model: DB.companyMeta,
						required: false,
						where: { key: 'plan' }
					}
				],

				order: [[Sequelize.col('orders.createdAt'), 'DESC']],
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
	}
}