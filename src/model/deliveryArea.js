import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de locais de entrega
 */

class DeliveryArea extends Sequelize.Model {}

DeliveryArea.init({
	name: {
		type: Sequelize.STRING,
	},
	center: {
		type: Sequelize.GEOMETRY('POINT'),
	},
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
	},
	radius: {
		type: Sequelize.FLOAT,
	},
	price: {
		type: Sequelize.FLOAT,
	}
}, {
	modelName: 'deliveryArea',
	tableName: 'delivery_areas',
	sequelize: conn,
});

export default DeliveryArea;