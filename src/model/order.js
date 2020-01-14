import Sequelize  from 'sequelize';

import conn  from '../services/connection';

/*
 * Define modelo (tabela) de pedidos
 */

class Orders extends Sequelize.Model {}
Orders.init({
	//Dados principais
	paymentFee: Sequelize.DECIMAL(10,2),
	deliveryPrice: Sequelize.STRING,
	type: {
		type: Sequelize.STRING,
		allowNull: false,
		defaultValue: 'takeout',
		comment: 'takeout | delivery',
		validate: {
			isIn: {
				args: [['takeout', 'delivery']],
				msg: 'Esse tipo de pedido não é válido',
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
	discount: {
		type: Sequelize.DECIMAL(10, 2),
		set (val) {
			if (typeof val == 'string')
				this.setDataValue('discount', parseFloat(val.replace(',', '.')));
			else
				this.setDataValue('discount', val);
		},
		get () {
			return parseFloat(this.getDataValue('discount'));
		}
	},
	status: {
		type: Sequelize.STRING,
		comment: 'waiting | preparing | delivery | delivered | canceled',
		defaultValue: 'waiting',
		validate: {
			isIn: [['waiting', 'preparing', 'delivery', 'delivered', 'canceled']],
		}
	},
	message: Sequelize.TEXT,

	//Endereço da entrega
	street: Sequelize.STRING,
	number: Sequelize.INTEGER,
	complement: Sequelize.STRING,
	city: Sequelize.STRING,
	state: Sequelize.STRING,
	district: Sequelize.STRING,
	zipcode: Sequelize.STRING,
	
}, { modelName: 'orders',  sequelize: conn });

export default Orders;