import DataLoader from 'dataloader';

import Company from '../model/company';
import Coupon from '../model/coupon';
import CreditHistory from '../model/creditHistory';
import Delivery from '../model/delivery';
import OrderOptions from '../model/orderOptions';
import OrderOptionsGroup from '../model/orderOptionsGroup';
import OrderProduct from '../model/orderProduct';
import PaymentMethod from '../model/paymentMethod';
import { remap } from './remap';

export const orderCompanyLoader = new DataLoader(async keys => {
	const companies = await Company.findAll({
		where: { id: keys }
	});
	
	return remap(keys, companies)

}, { cache: false })

export const orderProductsLoader = new DataLoader(async keys => {
	const allGroups = await OrderProduct.findAll({
		where: { orderId: keys },
		order: [['name', 'ASC']]
	});
	
	return keys.map(key => {
		const orderProducts = allGroups.filter(m => m.orderId === key);

		return orderProducts;

		//return [];
	})
}, { cache: false })

export const orderOptionsGroupsLoader = new DataLoader(async keys => {
	const allGroups = await OrderOptionsGroup.findAll({
		where: { orderProductId: keys }
	});
	
	return keys.map(key => {
		const productGroups = allGroups.filter(m => m.orderProductId === key)
		return productGroups;
	})
}, { cache: false })

export const orderOptionsLoader = new DataLoader(async keys => {
	const allOptions = await OrderOptions.findAll({
		where: { orderOptionsGroupId: keys }
	});
	
	return keys.map(key => {
		const groupOptions = allOptions.filter(m => m.orderOptionsGroupId === key)
		return groupOptions;
	})
}, { cache: false })

export const creditHistoryLoader = new DataLoader(async keys => {
	const histories = await CreditHistory.findAll({
		where: { id: keys }
	});
	
	return remap(keys, histories)
}, { cache: false })

export const orderPaymentMethodLoader = new DataLoader(async keys => {
	const methods = await PaymentMethod.findAll({
		where: { id: keys }
	});
	
	return remap(keys, methods)
}, { cache: false })

export const orderCouponLoader = new DataLoader(async keys => {
	const coupons = await Coupon.findAll({
		where: { id: keys }
	});
	
	return remap(keys, coupons)
}, { cache: false })

export const orderDeliveryLoader = new DataLoader(async keys => {
	const deliveries = await Delivery.findAll({
		where: { orderId: keys }
	});
	
	return remap(keys, deliveries, 'orderId')
}, { cache: false })