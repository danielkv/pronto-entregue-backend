const sequelize = require('../services/connection');
const Sequelize = require('sequelize');

/*
 * Define modelo (tabela) de relação de empresas e usuários
 */

class BranchesUsers extends Sequelize.Model {};
BranchesUsers.init({
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey:true,
		autoIncrement:true
	},
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	},
}, {modelName:'branch_relation', tableName:'branches_users', underscored:true, sequelize});

module.exports = BranchesUsers;