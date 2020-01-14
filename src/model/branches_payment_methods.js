import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de métodos de pagamentos das filiais
 */

class BranchesPaymentMethods extends Sequelize.Model {}
BranchesPaymentMethods.init({
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey:true,
		autoIncrement:true
	},
	settings: {
		type: Sequelize.TEXT,
		set(val) {
			this.setDataValue('settings', JSON.stringify(val));
		},
		get () {
			return JSON.parse(this.getDataValue('settings'));
		}
	},
}, { modelName:'association', tableName:'branches_payment_methods', underscored:true, sequelize: conn, name:{ singular:'PaymentMethod', plural:'PaymentMethods' } });

export default BranchesPaymentMethods;