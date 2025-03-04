import Sequelize  from 'sequelize';

import cache from '../cache';
import conn from '../services/connection';

/*
 * Define modelo (tabela) de produtos
 */

class Product extends Sequelize.Model {}
Product.init({
	name: Sequelize.STRING,
	description: Sequelize.STRING,
	sku: Sequelize.STRING(100),
	image: Sequelize.TEXT,
	minDeliveryTime: Sequelize.INTEGER, // in hours
	scheduleEnabled: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	},
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
	},
	listed: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
		comment: 'Show the product in product list and search',
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
		type: Sequelize.ENUM('inline', 'panel'),
		defaultValue: 'inline',
		allowNull: false
	},
	fromPrice: {
		type: Sequelize.DECIMAL(10, 2),
		set (val) {
			if (typeof val == 'string')
				this.setDataValue('fromPrice', parseFloat(val.replace(',', '.')));
			else
				this.setDataValue('fromPrice', val);
		},
		get () {
			return parseFloat(this.getDataValue('fromPrice'));
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

export default cache.withCache(Product);