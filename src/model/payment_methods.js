import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de pedidos
 */

class PaymentMethods extends Sequelize.Model {}
PaymentMethods.init({
	name: Sequelize.STRING,
	display_name: Sequelize.STRING,
}, { modelName:'payment_methods', underscored:true, sequelize: conn, name:{ singular:'PaymentMethod', plural:'PaymentMethods' } });

export default PaymentMethods;