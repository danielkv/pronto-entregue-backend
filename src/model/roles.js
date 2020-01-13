import Sequelize  from 'sequelize';

import sequelize  from '../services/connection';

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
}, { modelName:'roles', sequelize });

export default Roles;