import Sequelize  from 'sequelize';

import cache from '../cache';
import conn from '../services/connection';

/*
 * Define modelo (tabela) de empresas
 */

class Company extends Sequelize.Model {}

Company.init({
	name: Sequelize.STRING,
	displayName: Sequelize.STRING,
	backgroundColor: Sequelize.STRING(10),
	image: Sequelize.TEXT,
	published: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	acceptTakeout: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: true,
	},
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 0,
	},
}, {
	modelName: 'company',
	tableName: 'companies',
	sequelize: conn
});

export default cache.withCache(Company);