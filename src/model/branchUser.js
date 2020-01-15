import Sequelize  from 'sequelize';

import conn  from '../services/connection';

/*
 * Define modelo (tabela) de relação de empresas e usuários
 */

class BranchesUsers extends Sequelize.Model {}
BranchesUsers.init({
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
	modelName: 'branchRelation',
	tableName: 'branch_users',
	sequelize: conn
});

export default BranchesUsers;