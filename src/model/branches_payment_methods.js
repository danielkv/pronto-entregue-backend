const sequelize = require('../services/connection');
const Sequelize = require('sequelize');

/*
 * Define modelo (tabela) de métodos de pagamentos das filiais
 */

class BranchesPaymentMethods extends Sequelize.Model {};
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
}, {modelName:'association', tableName:'branches_payment_methods', underscored:true, sequelize, name:{singular:'PaymentMethod', plural:'PaymentMethods'}});

module.exports = BranchesPaymentMethods;