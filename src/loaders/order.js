import DataLoader from 'dataloader';
import { literal, Op, fn } from 'sequelize';

import Company from '../model/company';
import Option from '../model/option';
import OptionsGroup from '../model/optionsGroup';
import OrderProduct from '../model/orderProduct';
import Sale from '../model/sale';
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

export const optionsGroupsLoader = new DataLoader(async keys => {
	const allGroups = await OptionsGroup.findAll({
		where: { productId: keys, active: true, removed: false },
		order: [['productId', 'ASC'], ['order', 'ASC']]
	});
	
	return keys.map(key => {
		const productGroups = allGroups.filter(m => m.productId === key)
		return productGroups;

		//return [];
	})
}, { cache: false })

export const optionsLoader = new DataLoader(async keys => {
	const allOptions = await Option.findAll({
		where: { optionsGroupId: keys, active: true, removed: false },
		order: [['optionsGroupId', 'ASC'], ['order', 'ASC']]
	});
	
	return keys.map(key => {
		const groupOptions = allOptions.filter(m => m.optionsGroupId === key)
		return groupOptions;

		//return [];
	})
}, { cache: false })

export const restrainedByLoader = new DataLoader(async keys => {
	const optionGroups = await OptionsGroup.findAll({
		where: { maxSelectRestrain: keys, active: true },
		//order: [[literal(`FIELD(maxSelectRestrain, ${keys.join(', ')})`)]]
	});
	
	return keys.map(key => {
		const optionsGroup = optionGroups.find(m => m.maxSelectRestrain === key)
		if (optionsGroup) return optionsGroup

		return null;
	})
}, { cache: false })


export const groupRestrainedLoader = new DataLoader(async keys => {
	const optionsGroups = await OptionsGroup.findAll({
		where: { id: keys, active: true },
		//order: [[literal(`FIELD(id, ${keys.join(', ')})`)]]
	});
	
	return keys.map(key => {
		const optionsGroup = optionsGroups.find(m => m.id === key)
		if (optionsGroup) return optionsGroup;

		return null;
	})
}, { cache: false })

export const productSaleLoader = new DataLoader(async keys => {
	const sales = await Sale.findAll({
		attributes: {
			include: [[literal('IF(startsAt <= NOW() AND expiresAt >= NOW() AND active, true, false)'), 'progress']]
		},
		where: {
			productId: keys,
			[Op.or]: [{
				expiresAt: { [Op.gte]: fn('NOW') },
				startsAt: { [Op.lte]: fn('NOW') },
			}, {
				startsAt: { [Op.gt]: fn('NOW') },
			}],
			removed: false
		},
		order: [['startsAt', 'ASC'], ['createdAt', 'DESC']],
		group: 'productId'
	})

	return keys.map(key => {
		const sale = sales.find(m => m.productId === key)
		if (sale) return sale;

		return null;
	})
	
}, { cache: false })