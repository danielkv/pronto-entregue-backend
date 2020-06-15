import { col, fn } from "sequelize";

import CreditBalance from "../creditBalance";
import CreditHistory from "../creditHistory";

export default new class CreditHistoryTriggerFactory {

	start () {
		CreditHistory.afterSave('updateCreditBalance', this.updateCreditBalance);

		console.log(' - Setup credit history triggers')
	}

	async updateCreditBalance (history, { transaction }) {
		const userId = history.get('userId');

		const [balance] = await CreditHistory.findAll({
			attributes: [
				[fn('SUM', col('value')), 'totalBalance']
			],
			where: { userId },
			transaction
		})

		await CreditBalance.update({ value: balance.get('totalBalance') }, { where: { userId }, transaction });
	}

}