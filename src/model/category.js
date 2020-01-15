import Sequelize from 'sequelize';

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
	sequelize: conn,
	name: { singular: 'category', plural: 'categories' }
});

export default Category;