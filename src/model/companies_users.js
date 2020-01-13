import Sequelize  from 'sequelize';

import sequelize  from '../services/connection';

/*
 * Define modelo (tabela) de relação de empresas e usuários
 */

class CompaniesUsers extends Sequelize.Model {}
CompaniesUsers.init({
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey:true,
		autoIncrement:true
	},
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	},
}, { modelName:'company_relation', tableName:'companies_users', underscored:true, sequelize });

export default CompaniesUsers;