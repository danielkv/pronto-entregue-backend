const sequelize = require('../services/connection');
const Sequelize = require('sequelize');

/*
 * Define modelo (tabela) de opções
 */

class Items extends Sequelize.Model {};

Items.init({
	name: Sequelize.STRING,
	description: Sequelize.STRING,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	},
}, {modelName:'items', underscored:true, sequelize, name:{singular:'item', plural:'items'}});

module.exports = Items;