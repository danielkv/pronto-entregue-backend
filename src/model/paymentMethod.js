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