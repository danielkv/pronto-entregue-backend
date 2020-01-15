import Sequelize  from 'sequelize';

import conn  from '../services/connection';

/*
 * Define modelo (tabela) de relação de empresas e usuários
 */

class BranchUser extends Sequelize.Model {}
BranchUser.init({
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey: true,
		autoIncrement: true
	},
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	},
}, {
	modelName: 'branchUser',
	tableName: 'branches_users',
	sequelize: conn
});

export default BranchUser;