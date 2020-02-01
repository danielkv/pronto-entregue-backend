import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de locais de entrega
 */

class DeliveryArea extends Sequelize.Model {}

DeliveryArea.init({
	distance: {
		type: Sequelize.INTEGER,
		allowNull: false
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