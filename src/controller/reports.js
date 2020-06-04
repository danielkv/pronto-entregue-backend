import { defaultPlan } from "../utilities/company";

export function calculateCompanies(companies) {

	let revenue = 0;
	let taxable = 0;
	let credits = 0;
	let companyDiscount = 0;
	let totalDiscount = 0;
	let tax = 0;

	const companiesResult = companies.map(company => {
		const plan = company.metas.length ? JSON.parse(company.metas[0].value) : defaultPlan();
		const companyResult = calculateCompanyValues(company, plan);

		revenue += companyResult.revenue;
		taxable += companyResult.taxable;
		credits += companyResult.credits;
		companyDiscount += companyResult.companyDiscount;
		totalDiscount += companyResult.totalDiscount;
		tax += companyResult.tax;

		return companyResult;
	})

	
	
	return {
		companies: companiesResult,
		revenue,
		taxable,
		credits,
		companyDiscount,
		totalDiscount,
		tax,
	}
	
}

export function calculateCompanyValues(company, plan) {
	
	const orders = company.orders.map(order => calculateOrderValues(order, plan))

	const revenue = orders.reduce((value, order)=>order.subtotal+value, 0);
	const taxable = orders.reduce((value, order)=>order.taxable+value, 0);
	const credits = revenue - taxable;
	const companyDiscount = orders.reduce((value, order)=>order.discount+value, -credits);
	const totalDiscount = companyDiscount + credits;
	
	return {
		...company.get(),
		plan,
		orders,
		revenue,
		taxable,
		credits,
		companyDiscount,
		totalDiscount,
		tax: (plan.valueType === 'pct') ? taxable * plan.value : (plan.type === 'perorder') ? orders.length * plan.value : plan.value,
	}
	
}

function calculateOrderValues(order, plan) {
	let tax = 0;
	const taxable = calculateTaxableOrderValue(order);

	if (plan.type === 'perorder') {
		tax = (plan.valueType == 'pct') ? taxable * plan.value : plan.value;
	} else
		tax = 0;

	return {
		...order.get(),
		subtotal: order.price + order.discount,
		tax,
		taxable
	};
}

function calculateTaxableOrderValue(order) {
	const { discount, price } = order;
	const subtotal = price + discount;
	let taxValueCalculation = subtotal;

	if (discount && order.get('creditHistory')) taxValueCalculation -= Math.abs(order.creditHistory.value);

	return taxValueCalculation;
}