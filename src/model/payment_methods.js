import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de pedidos
 */

class PaymentMethods extends Sequelize.Model {}
PaymentMethods.init({
	name: Sequelize.STRING,
	displayName: Sequelize.STRING,
}, {
	tableName: 'payment_methods',
	sequelize: conn
});

export default PaymentMethods;