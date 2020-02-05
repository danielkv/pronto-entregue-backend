import { col, fn } from "sequelize";

import CreditBalance from "../creditBalance";
import CreditHistory from "../creditHistory";

async function updateCreditBalance (history) {
	const userId = history.get('userId');

	const [balance] = await CreditHistory.findAll({
		attributes: [
			[fn('SUM', col('value')), 'totalBalance']
		],
		where: { userId }
	})

	await CreditBalance.update({ value: balance.get('totalBalance') }, { where: { userId } });
}

CreditHistory.afterSave('updateCreditBalance', updateCreditBalance);