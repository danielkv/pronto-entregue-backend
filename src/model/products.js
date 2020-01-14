import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de produtos
 */

class Products extends Sequelize.Model {}
Products.init({
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: 1,
	},
	name: Sequelize.STRING,
	description: Sequelize.STRING,
	image: Sequelize.TEXT,
	featured: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	},
	order: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull:false,
		validate : {
			notEmpty:{ msg:'Você deve definir uma ordem' },
			notNull:{ msg:'Você deve definir uma ordem' },
		}
	},
	type: {
		type: Sequelize.STRING(50),
		comment: 'inline | panel',
		validate: {
			isIn : {
				args : [['inline', 'panel']],
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
}, { modelName:'products', underscored:true, sequelize: conn });

export default Products;