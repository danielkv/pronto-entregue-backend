import DataLoader from 'dataloader';
import { literal } from 'sequelize';

import CompanyMeta from '../model/companyMeta';
import CreditBalance from '../model/creditBalance';

export const balanceLoader = new DataLoader(async keys => {
	const balances = await CreditBalance.findAll({
		where: { userId: keys },
		order: [[literal(`FIELD(userId, ${keys.join(', ')})`)]]
	})

	return balances; //remap(keys, balances, 'userId');
}, { cache: false })

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
})