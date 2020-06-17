import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de locais de entrega
 */

class peDeliveryArea extends Sequelize.Model {}

peDeliveryArea.init({
	name: {
		type: Sequelize.STRING,
	},
	center: {
		type: Sequelize.GEOMETRY('POINT'),
		allowNull: false,
	},
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
	},
	radius: {
		type: Sequelize.FLOAT,
		allowNull: false,
	},
	price: {
		type: Sequelize.DECIMAL(2),
	}
}, {
	modelName: 'peDeliveryArea',
	tableName: 'pe_delivery_areas',
	sequelize: conn,
});

export default peDeliveryArea;