import Sequelize from 'sequelize';

import conn from '../services/connection';

class CreditBalance extends Sequelize.Model {}
CreditBalance.init({
	value: Sequelize.FLOAT,
}, {
	modelName: 'creditBalance',
	tableName: 'credit_balances',
	sequelize: conn,
});

export default CreditBalance;