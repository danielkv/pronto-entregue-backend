import Sequelize from 'sequelize';

import conn from '../services/connection';

class CreditHistory extends Sequelize.Model {}
CreditHistory.init({
	value: Sequelize.FLOAT,
	history: Sequelize.STRING,
}, {
	name: { singular: 'creditHistory', plural: 'creditHistory' },
	modelName: 'creditHistory',
	tableName: 'credit_history',
	sequelize: conn,
});

export default CreditHistory;