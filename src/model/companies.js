const sequelize = require('../services/connection');
const Sequelize = require('sequelize');

/*
 * Define modelo (tabela) de empresas
 */

class Companies extends Sequelize.Model {};
Companies.init({
	name: Sequelize.STRING,
	display_name: Sequelize.STRING,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 0,
	},
}, {modelName:'companies', underscored:true, sequelize});

module.exports = Companies;