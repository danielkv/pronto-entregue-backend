import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de pedidos
 */

class PaymentMethod extends Sequelize.Model {}
PaymentMethod.init({
	name: Sequelize.STRING,
	displayName: Sequelize.STRING,
}, {
	modelName: 'payment_methods',
	sequelize: conn,
});

export default PaymentMethod;