import { defaultPlan } from "../utilities/company";

class CompaniesReportControl {

	orderCouponValue(orderInstance) {
		const coupon = orderInstance.get('coupon');
		if (!coupon) return 0;

		const subtotal = parseFloat(orderInstance.price) + parseFloat(orderInstance.discount);
		const calculateCoupon = subtotal - parseFloat(orderInstance.deliveryPrice);

		let couponValue = 0;

		switch (coupon.valueType) {
			case 'value':
				couponValue = parseFloat(coupon.value);
				break;
			default:
				couponValue = parseFloat(coupon.value) / 100 * calculateCoupon;
				break;
		}

		if (coupon.freeDelivery) {
			const deliveryPrice = parseFloat(orderInstance.get('deliveryPrice'));
			couponValue += deliveryPrice;
		}

		return couponValue;
	}

	orderCouponTaxable (orderInstance) {
		const coupon = orderInstance.get('coupon');
		if (!coupon) return 0;
		
		const couponValue = this.orderCouponValue(orderInstance);
		return couponValue * (coupon.taxable / 100);
	}

	couponNonTaxable(orderInstance) {
		const couponValue = this.orderCouponValue(orderInstance);
		const taxableValue = this.orderCouponTaxable(orderInstance);
		return couponValue - taxableValue
	}

	calculate(companies) {

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
			const companyResult = this.companyValues(company, plan);
	
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

	companyValues(company, plan) {
		const orders = company.orders.map(order => this.orderValues(order, plan));
	
		const revenue = orders.reduce((value, order)=>order.subtotal + parseFloat(value), 0);
		const credits = orders.reduce((value, order)=>order.creditValue + value, 0);
		const coupons = orders.reduce((value, order)=>order.couponValue + parseFloat(value), 0);
		const taxableCoupon = orders.reduce((value, order)=>order.taxableCoupon + parseFloat(value), 0);
		const companyDiscount = orders.reduce((value, order)=>order.discount + value, -credits);
		const totalDiscount = companyDiscount + credits;
		
		const taxable = orders.reduce((value, order)=>(parseFloat(order.taxable) + value), 0);
		
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

	orderCreditValue(order) {
		const creditHistory = order.get('creditHistory');
		if (!creditHistory) return 0;
	
		return creditHistory.value;
	}

	orderValues(order, plan) {
		let tax = 0;
		const taxable = this.orderTaxable(order);
		const couponValue = this.orderCouponValue(order);
		const taxableCoupon = this.orderCouponTaxable(order);
		const creditValue = this.orderCreditValue(order);
	
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
	
	orderTaxable(order) {
		const { discount, price } = order;
		const subtotal = parseFloat(price) + parseFloat(discount);
		let taxValueCalculation = subtotal;
	
		// coupon
		if (discount && order.get('coupon')) {
			const nonTaxable = this.couponNonTaxable(order);
	
			taxValueCalculation -= nonTaxable;
		}
		return taxValueCalculation;
	}
}

const CompaniesReportController = new CompaniesReportControl();
export default CompaniesReportController;