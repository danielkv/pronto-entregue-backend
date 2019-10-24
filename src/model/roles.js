const sequelize = require('../services/connection');
const Sequelize = require('sequelize');

/*
 * Define modelo (tabela) de permissões
 */

class Roles extends Sequelize.Model {}
Roles.init({
	name: Sequelize.STRING,
	display_name: Sequelize.STRING,
	permissions: {
		type: Sequelize.TEXT,
		get () {
			return JSON.parse(this.getDataValue('permissions'));
		}
	},
}, {modelName:'roles', sequelize});

module.exports = Roles;