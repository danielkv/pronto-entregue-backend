import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de pedidos
 */

class PaymentMethod extends Sequelize.Model {}
PaymentMethod.init({
	type: {
		type: Sequelize.ENUM('money', 'delivery', 'app'),
		allowNull: false,
		defaultValue: 'delivery'
	},
	displayName: Sequelize.STRING,
	image: Sequelize.TEXT,
	order: {
		type: Sequelize.INTEGER(2),
		defaultValue: 0,
		allowNull: false
	},
	fee: {
		type: Sequelize.DECIMAL(10, 2),
		allowNull: false,
		defaultValue: 0
	},
	feeType: {
		type: Sequelize.ENUM('value', 'pct'),
		allowNull: false,
		defaultValue: 'pct'
	},
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
		allowNull: false
	}
}, {
	modelName: 'paymentMethod',
	tableName: 'payment_methods',
	sequelize: conn,
});

export default PaymentMethod;