import Sequelize from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de permissões
 */

class Role extends Sequelize.Model {}
Role.init({
	name: Sequelize.STRING,
	displayName: Sequelize.STRING,
	permissions: {
		type: Sequelize.TEXT,
		get () {
			return JSON.parse(this.getDataValue('permissions'));
		}
	},
}, {
	modelName: 'roles',
	sequelize: conn
});

export default Role;