import DataLoader from 'dataloader';
import { literal, Op, fn } from 'sequelize';

import OptionsGroup from '../model/optionsGroup';
import Product from '../model/product';
import Sale from '../model/sale';

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