import Sequelize  from 'sequelize';

import sequelize  from '../services/connection';

/*
 * Define modelo (tabela) de categorias de produtos
 */

class ProductsCategories extends Sequelize.Model {}
ProductsCategories.init({
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
		allowNull:false,
		validate : {
			notEmpty:{ msg:'Você deve definir uma ordem' },
			notNull:{ msg:'Você deve definir uma ordem' },
		}
	},
}, { modelName:'products_categories', underscored:true, sequelize, name:{ singular:'category', plural:'categories' } });

export default ProductsCategories;