export function calculateCompanyValues(company, plan) {
	
	const orders = company.orders.map(order => calculateOrderValues(order, plan))

	const revenue = orders.reduce((value, order)=>order.subtotal+value, 0);
	const taxable = orders.reduce((value, order)=>order.taxable+value, 0);
	const usDiscount = revenue - taxable;
	const companyDiscount = orders.reduce((value, order)=>order.discount+value, -usDiscount);
	const totalDiscount = companyDiscount + usDiscount;
	
	return {
		...company.get(),
		plan,
		orders,
		revenue,
		taxable,
		usDiscount,
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