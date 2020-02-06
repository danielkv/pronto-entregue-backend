import DataLoader from 'dataloader';
import { literal } from 'sequelize';

import CreditBalance from '../model/creditBalance';

export default new DataLoader(async keys => {
	const balances = await CreditBalance.findAll({
		where: { id: keys },
		order: [[literal(`FIELD(userId, ${keys.join(', ')})`)]]
	})

	return balances; //remap(keys, balances, 'userId');
}, { cache: false })