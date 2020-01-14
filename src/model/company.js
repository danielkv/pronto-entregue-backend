import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de empresas
 */

class Company extends Sequelize.Model {}
Company.init({
	name: Sequelize.STRING,
	displayName: Sequelize.STRING,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 0,
	},
}, {
	modelName: 'companies',
	sequelize: conn
});

export default Company;