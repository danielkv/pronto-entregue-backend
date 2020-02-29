import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de empresas
 */

class Sale extends Sequelize.Model {}
Sale.init({
	price: {
		type: Sequelize.DECIMAL(10, 2),
		allowNull: false,
	},
	startsAt: Sequelize.DATE,
	expiresAt: Sequelize.DATE,
	active: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
	removed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
}, {
	modelName: 'sale',
	tableName: 'sales',
	sequelize: conn
});

export default Sale;