import DataLoader from 'dataloader';

import Company from '../model/company';
import CreditHistory from '../model/creditHistory';
import OrderOptions from '../model/orderOptions';
import OrderOptionsGroup from '../model/orderOptionsGroup';
import OrderProduct from '../model/orderProduct';
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
		where: { orderId: keys }
	});
	
	return remap(keys, histories, 'orderId')
}, { cache: false })