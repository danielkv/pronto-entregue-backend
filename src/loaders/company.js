import DataLoader from 'dataloader';

import CompanyMeta from '../model/companyMeta';
import { defaultBusinessHours } from '../utilities/company';
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

export const businessHoursLoader = new DataLoader(async keys => {
	const metas = await CompanyMeta.findAll({
		where: {
			companyId: keys,
			key: 'businessHours'
		},
		//order: [[literal(`FIELD(companyId, ${keys.join(', ')})`)]]
	})
	

	return remap(keys, metas, 'companyId', (m)=>{
		if (m)
			return JSON.parse(m.value)
		else
			return defaultBusinessHours();
	});
	
}, { cache: false });