import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de opções de produtos de pedidos
 */

class OrdersOptions extends Sequelize.Model {
	static updateAll (options, groupModel, transaction=null) {

		//cria novas opções
		return Promise.all(
			options.map((option) => {
				delete option.id;
				return groupModel.createOption(option, { transaction });
			})
		);
		
	}
}
OrdersOptions.init({
	id: {
		type: Sequelize.INTEGER.UNSIGNED,
		primaryKey: true,
		autoIncrement: true
	},
	name: Sequelize.STRING,
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
}, { modelName: 'orders_options',  sequelize: conn });

export default OrdersOptions;