import Sequelize  from 'sequelize';

import sequelize  from '../services/connection';

/*
 * Define modelo (tabela) de pedidos
 */

class PaymentMethods extends Sequelize.Model {}
PaymentMethods.init({
	name: Sequelize.STRING,
	display_name: Sequelize.STRING,
}, { modelName:'payment_methods', underscored:true, sequelize, name:{ singular:'PaymentMethod', plural:'PaymentMethods' } });

export default PaymentMethods;