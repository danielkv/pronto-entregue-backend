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
		const coupon = orderInstance.get('coupon');
		if (!coupon) return 0;
		
		const couponValue = this.orderCouponValue(orderInstance);
		return couponValue * (( 100 - coupon.taxable ) / 100);
	}

	calculate(companies) {

		let revenue = 0;
		let taxable = 0;
		let refund = 0;
		let credits = 0;
		let coupons = 0;
		let taxableCoupon = 0;
		let companyDiscount = 0;
		let totalDiscount = 0;
		let countPeDelivery = 0;
		let deliveryPaymentValue = 0;
		let tax = 0;
		let payment = 0;
	
		const companiesResult = companies.map(company => {
			const plan = company.metas.length ? JSON.parse(company.metas[0].value) : defaultPlan();
			const companyResult = this.companyValues(company, plan);
	
			revenue += companyResult.revenue;
			taxable += companyResult.taxable;
			credits += companyResult.credits;
			coupons += companyResult.coupons;
			refund += companyResult.refund;
			taxableCoupon += companyResult.taxableCoupon;
			companyDiscount += companyResult.companyDiscount;
			totalDiscount += companyResult.totalDiscount;
			tax += companyResult.tax;
			deliveryPaymentValue += companyResult.deliveryPaymentValue;
			countPeDelivery += companyResult.countPeDelivery;
			payment += companyResult.payment;
	
			return companyResult;
		})
	
		return {
			companies: companiesResult,
			revenue,
			taxable,
			refund,
			credits,
			coupons,
			taxableCoupon,
			companyDiscount,
			totalDiscount,
			tax,
			deliveryPaymentValue,
			countPeDelivery,
			payment
		}
	}

	companyValues(company, plan) {
		const orders = company.orders.map(order => this.orderValues(order, plan));

		const data = orders.reduce((values, order)=>{
			return {
				payment: values.payment + Number(order.payment),
				revenue: values.revenue + Number(order.subtotal) + Number(order.deliveryPrice),
				credits: values.credits + Number(order.creditValue),
				coupons: values.coupons + Number(order.couponValue),
				refund: values.refund + Number(order.refund),
				taxableCoupon: values.taxableCoupon + Number(order.taxableCoupon),
				totalDiscount: values.totalDiscount + Number(order.discount),
				taxable: values.taxable + Number(order.taxable),
				deliveryPaymentValue: values.deliveryPaymentValue + Number(order.deliveryPaymentValue),
			}
		}, {
			revenue: 0,
			credits: 0,
			coupons: 0,
			refund: 0,
			taxableCoupon: 0,
			totalDiscount: 0,
			taxable: 0,
			deliveryPaymentValue: 0,
			payment: 0,
		})

		const tax = this.companyTax(orders, plan, data.taxable);
		const countPeDelivery = orders.filter(order => order.type === 'peDelivery').length
		
		return {
			...company.get(),
			plan,
			orders,
			tax,
			countPeDelivery,

			...data
			
		}
		
	}

	companyTax(orders, plan, taxable) {
		if (plan.valueType === 'pct')
			return taxable * plan.value
		else
			return (plan.type === 'perorder')
				? orders.length * plan.value
				: plan.value
	}

	orderRefund(order) {
		const creditValue = this.orderCreditValue(order)
		const counponValue = this.orderCouponValue(order)
		const couponTaxable = this.orderCouponTaxable(order);

		return creditValue + (counponValue - couponTaxable);
	}

	orderCreditValue(order) {
		const creditHistory = order.get('creditHistory');
		if (!creditHistory) return 0;
	
		return creditHistory.value;
	}

	orderTax(plan, taxable) {
		if (plan.type === 'perorder') {
			return (plan.valueType == 'pct') ? taxable * plan.value : plan.value;
		} else

			// define monthly
			return 0;
	}

	orderDeliveryPaymentValue(order) {
		return order.type === 'peDelivery' ? Number(order.deliveryPrice) : 0;
	}

	orderPayment(tax, deliveryPaymentValue, refund) {
		const payment = Number(tax) + Number(deliveryPaymentValue) - Number(refund);
		return payment;
	}

	orderValues(order, plan) {
		const taxable = this.orderTaxable(order);
		const couponValue = this.orderCouponValue(order);
		const taxableCoupon = this.orderCouponTaxable(order);
		const creditValue = this.orderCreditValue(order);
		const refund = this.orderRefund(order);
		const subtotal = this.orderSubtotal(order)
		const tax = this.orderTax(plan, taxable);
		const deliveryPaymentValue = this.orderDeliveryPaymentValue(order);
		const payment = this.orderPayment(tax, deliveryPaymentValue, refund);
	
		return {
			...order.get(),
			subtotal,
			couponValue,
			taxableCoupon,
			creditValue,
			refund,
			tax,
			taxable,
			deliveryPaymentValue,
			payment
		};
	}

	orderSubtotal(order) {
		return order.price + order.discount - order.deliveryPrice
	}

	orderSubtotalTaxable(order) {
		return order.price + order.discount;
	}
	
	orderTaxable(order) {
		const subtotal = this.orderSubtotalTaxable(order);
	
		// coupon
		const couponNonTaxable = this.couponNonTaxable(order);
		const taxValueCalculation = subtotal - couponNonTaxable;
		
		return taxValueCalculation;
	}
}

const CompaniesReportController = new CompaniesReportControl();
export default CompaniesReportController;