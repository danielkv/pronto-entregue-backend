import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de relação de empresas e usuários
 */

class CompanyUser extends Sequelize.Model {}
CompanyUser.init({
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
	modelName: 'company_relation',
	tableName: 'company_users',
	sequelize: conn
});

export default CompanyUser;