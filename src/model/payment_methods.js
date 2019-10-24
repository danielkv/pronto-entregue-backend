const sequelize = require('../services/connection');
const Sequelize = require('sequelize');

/*
 * Define modelo (tabela) de pedidos
 */

class PaymentMethods extends Sequelize.Model {};
PaymentMethods.init({
	name: Sequelize.STRING,
	display_name: Sequelize.STRING,
}, {modelName:'payment_methods', underscored:true, sequelize, name:{singular:'PaymentMethod', plural:'PaymentMethods'}});

module.exports = PaymentMethods;