import DataLoader from 'dataloader';
import { fn, col } from 'sequelize';

import CompanyMeta from '../model/companyMeta';
import Rating from '../model/rating';
import { defaultBusinessHours, defaultPlan } from '../utilities/company';
import { remap } from './remap';

export const deliveryTimeLoader = new DataLoader(async keys => {
	const metas = await CompanyMeta.findAll({
		where: {
			companyId: keys,
			key: 'deliveryTime'
		},
		//order: [[literal(`FIELD(companyId, ${keys.join(', ')})`)]]
	});

	// return metas;
	
	return keys.map(key => {
		const meta = metas.find(m => m.companyId === key)
		if (meta) return parseInt(meta.value);

		return 0;
	})
}, { cache: false })

export const rateLoader = new DataLoader(async keys => {
	const rates = await Rating.findAll({
		attributes: { include: [[fn('AVG', col('rate')), 'rateAvarage']] },
		where: { companyId: keys },
		group: 'companyId'
	})
	
	return remap(keys, rates, 'companyId', (r)=>{
		if (r)
			return r.get('rateAvarage');
		else
			return 0;
	});
	
}, { cache: false });

export const businessHoursLoader = new DataLoader(async keys => {
	const metas = await CompanyMeta.findAll({
		where: {
			companyId: keys,
			key: 'businessHours'
		},
	})

	return remap(keys, metas, 'companyId', (m) => {
		if (m)
			return JSON.parse(m.value)
		else
			return defaultBusinessHours();
	});
	
}, { cache: false });

export const planLoader = new DataLoader(async keys => {
	const metas = await CompanyMeta.findAll({ where: { companyId: keys, key: 'plan' } });

	return remap(keys, metas, 'companyId', (m) => {
		if (m)
			return JSON.parse(m.value)
		else
			return defaultPlan();
	});
	
}, { cache: false });