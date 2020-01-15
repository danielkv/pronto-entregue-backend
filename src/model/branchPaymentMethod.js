import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de métodos de pagamentos das filiais
 */

class BranchPaymentMethod extends Sequelize.Model {}

BranchPaymentMethod.init({
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey: true,
		autoIncrement: true
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
}, {
	modelName: 'BranchPaymentMethod',
	tableName: 'branch_payment_methods',
	sequelize: conn,
	name: { singular: 'PaymentMethod', plural: 'PaymentMethods' }
});

export default BranchPaymentMethod;