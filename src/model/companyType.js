import Sequelize from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de categorias de produtos
 */

class CompanyType extends Sequelize.Model {}
CompanyType.init({
	name: Sequelize.STRING,
	image: Sequelize.STRING,
	description: Sequelize.STRING,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	}
}, {
	modelName: 'companyType',
	tableName: 'company_types',
	sequelize: conn
});

export default CompanyType;