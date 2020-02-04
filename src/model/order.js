import Sequelize  from 'sequelize';

import conn  from '../services/connection';

/*
 * Define modelo (tabela) de pedidos
 */

class Order extends Sequelize.Model {}
Order.init({
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
		comment: 'waiting | preparing | delivering | delivered | canceled',
		defaultValue: 'waiting',
		validate: {
			isIn: [['waiting', 'preparing', 'delivering', 'delivered', 'canceled']],
		}
	},
	message: Sequelize.TEXT,

	//Endereço da entrega
	nameAddress: Sequelize.STRING,
	streetAddress: Sequelize.STRING,
	numberAddress: Sequelize.INTEGER,
	complementAddress: Sequelize.STRING,
	districtAddress: Sequelize.STRING,
	zipcodeAddress: Sequelize.INTEGER,
	cityAddress: Sequelize.STRING,
	stateAddress: Sequelize.STRING,
	locationAddress: Sequelize.GEOMETRY('POINT'),
}, {
	modelName: 'order',
	tableName: 'orders',
	sequelize: conn
});

export default Order;