import { defaultPlan } from "../utilities/company";

export function calculateCompanies(companies) {

	let revenue = 0;
	let taxable = 0;
	let credits = 0;
	let coupons = 0;
	let taxableCoupon = 0;
	let companyDiscount = 0;
	let totalDiscount = 0;
	let tax = 0;

	const companiesResult = companies.map(company => {
		const plan = company.metas.length ? JSON.parse(company.metas[0].value) : defaultPlan();
		const companyResult = calculateCompanyValues(company, plan);

		revenue += companyResult.revenue;
		taxable += companyResult.taxable;
		credits += companyResult.credits;
		coupons += companyResult.coupons;
		taxableCoupon += companyResult.taxableCoupon;
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
		coupons,
		taxableCoupon,
		companyDiscount,
		totalDiscount,
		tax,
	}
	
}

export function calculateCompanyValues(company, plan) {
	
	const orders = company.orders.map(order => calculateOrderValues(order, plan))

	const revenue = orders.reduce((value, order)=>order.subtotal + value, 0);
	const taxable = orders.reduce((value, order)=>order.taxable + value, 0);
	const credits = orders.reduce((value, order)=>order.creditValue + value, 0);
	const coupons = orders.reduce((value, order)=>order.couponValue + value, 0);
	const taxableCoupon = orders.reduce((value, order)=>order.taxableCoupon + value, 0);
	const companyDiscount = orders.reduce((value, order)=>order.discount+value, -credits);
	const totalDiscount = companyDiscount + credits;
	
	return {
		...company.get(),
		plan,
		orders,
		revenue,
		taxable,
		credits,
		coupons,
		taxableCoupon,
		companyDiscount,
		totalDiscount,
		tax: (plan.valueType === 'pct') ? taxable * plan.value : (plan.type === 'perorder') ? orders.length * plan.value : plan.value,
	}
	
}

function getCreditValue(order) {
	const creditHistory = order.get('creditHistory');
	if (!creditHistory) return 0;

	return creditHistory.value;
}

function getCouponValue(order) {
	const coupon = order.get('coupon');
	if (!coupon) return 0;

	const subtotal = order.price + order.discount;
	const calculateCoupon = subtotal - order.deliveryPrice;

	let couponValue = 0;

	switch (coupon.valueType) {
		case 'value':
			couponValue = coupon.value;
			break;
		default:
			couponValue = coupon.value / 100 * calculateCoupon;
			break;
	}

	if (coupon.freeDelivery) {
		const deliveryPrice = parseFloat(order.get('deliveryPrice'));
		couponValue += deliveryPrice;
	}

	return couponValue;
}

function getTaxableCoupon (order) {
	const coupon = order.get('coupon');
	if (!coupon) return 0;
	
	const couponValue = getCouponValue(order);
	return couponValue * (coupon.taxable / 100);
}

function calculateOrderValues(order, plan) {
	let tax = 0;
	const taxable = calculateTaxableOrderValue(order);
	const couponValue = getCouponValue(order);
	const taxableCoupon = getTaxableCoupon(order);
	const creditValue = getCreditValue(order);

	if (plan.type === 'perorder') {
		tax = (plan.valueType == 'pct') ? taxable * plan.value : plan.value;
	} else
		tax = 0;

	return {
		...order.get(),
		subtotal: order.price + order.discount,
		couponValue,
		taxableCoupon,
		creditValue,
		tax,
		taxable
	};
}

function calculateTaxableOrderValue(order) {
	const { discount, price } = order;
	const subtotal = price + discount;
	let taxValueCalculation = subtotal;

	// credits tax
	if (discount && order.get('creditHistory')) taxValueCalculation -= Math.abs(getCreditValue(order));

	if (discount && order.get('coupon')) {
		const couponValue = getCouponValue(order);
		const taxableValue = couponValue * (order.get('coupon').taxable / 100);

		taxValueCalculation -= Math.abs(couponValue - taxableValue);
	}

	return taxValueCalculation;
}