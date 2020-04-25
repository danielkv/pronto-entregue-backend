import DataLoader from 'dataloader';
import { literal } from 'sequelize';

import CreditBalance from '../model/creditBalance';

export const balanceLoader = new DataLoader(async keys => {
	const balances = await CreditBalance.findAll({
		where: { userId: keys },
		order: [[literal(`FIELD(userId, ${keys.join(', ')})`)]]
	})

	return balances;
}, { cache: false })
