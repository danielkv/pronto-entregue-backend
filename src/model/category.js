import Sequelize from 'sequelize';

import cache from '../cache';
import conn from '../services/connection';

/*
 * Define modelo (tabela) de categorias de produtos
 */

class Category extends Sequelize.Model {}
Category.init({
	name: Sequelize.STRING,
	image: Sequelize.STRING,
	description: Sequelize.STRING,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	},
	order: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
		validate: {
			notEmpty: { msg: 'Você deve definir uma ordem' },
			notNull: { msg: 'Você deve definir uma ordem' },
		}
	},
}, {
	modelName: 'category',
	tableName: 'categories',
	sequelize: conn
});

export default cache.withCache(Category);