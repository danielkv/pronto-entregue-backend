import Sequelize  from 'sequelize';

import sequelize  from '../services/connection';

/*
 * Define modelo (tabela) de pedidos
 */

class Orders extends Sequelize.Model {}
Orders.init({
	//branch_id => criado em 'relations'
	//user_id => criado em 'relations'
	//payment_method_id => criado em 'relations'

	//Dados principais
	payment_fee: Sequelize.DECIMAL(10,2),
	delivery_price: Sequelize.STRING,
	type : {
		type:Sequelize.STRING,
		allowNull : false,
		defaultValue : 'takeout',
		comment: 'takeout | delivery',
		validate : {
			isIn : {
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
		defaultValue : 'waiting',
		validate : {
			isIn : [['waiting', 'preparing', 'delivery', 'delivered', 'canceled']],
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
	
}, { modelName:'orders', underscored:true, sequelize });

export default Orders;