import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de locais de entrega
 */

class DeliveryArea extends Sequelize.Model {}

DeliveryArea.init({
	distance: {
		type: Sequelize.INTEGER
	},
	name: {
		type: Sequelize.STRING,
	},
	area: {
		type: Sequelize.GEOMETRY('POLYGON'),
		allowNull: false,
	},
	center: {
		type: Sequelize.GEOMETRY('POINT'),
		allowNull: false,
	},
	radius: {
		type: Sequelize.FLOAT,
		allowNull: false,
	},
	price: {
		type: Sequelize.FLOAT,
		allowNull: false
	}
}, {
	modelName: 'deliveryArea',
	tableName: 'delivery_areas',
	sequelize: conn,
});

export default DeliveryArea;