import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de produtos
 */

class Product extends Sequelize.Model {}
Product.init({
	name: Sequelize.STRING,
	description: Sequelize.STRING,
	image: Sequelize.TEXT,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
	},
	listed: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
		comment: 'Show the product in product list and search',
	},
	featured: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
		allowNull: false,
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
	type: {
		type: Sequelize.STRING(50),
		comment: 'inline | panel',
		validate: {
			isIn: {
				args: [['inline', 'panel']],
				msg: 'Tipo de produto inválido'
			}
		}
	},
	price: {
		type: Sequelize.DECIMAL(10, 2),
		set (val) {
			if (typeof val == 'string')
				this.setDataValue('price', parseFloat(val.replace(',', '.')));
			else
				this.setDataValue('price', val);
		},
		get () {
			return parseFloat(this.getDataValue('price'));
		}
	},
}, {
	modelName: 'product',
	tableName: 'products',
	sequelize: conn
});

export default Product;