import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de locais de entrega
 */

class Delivery extends Sequelize.Model {}

Delivery.init({
	description: {
		type: Sequelize.STRING,
	},
	size: {
		type: Sequelize.ENUM('small', 'medium', 'large'),
		defaultValue: 'medium'
	},
	status: {
		type: Sequelize.ENUM('waiting', 'waitingDelivery', 'delivering', 'delivered', 'canceled'),
		defaultValue: 'waitingDelivery'
	},
	value: {
		type: Sequelize.DECIMAL(2),
	},

	nameAddressFrom: Sequelize.STRING,
	streetAddressFrom: Sequelize.STRING,
	numberAddressFrom: Sequelize.INTEGER,
	complementAddressFrom: Sequelize.STRING,
	districtAddressFrom: Sequelize.STRING,
	zipcodeAddressFrom: Sequelize.INTEGER,
	cityAddressFrom: Sequelize.STRING,
	stateAddressFrom: Sequelize.STRING,
	referenceAddressFrom: Sequelize.STRING,
	locationAddressFrom: Sequelize.GEOMETRY('POINT'),

	nameAddressTo: Sequelize.STRING,
	streetAddressTo: Sequelize.STRING,
	numberAddressTo: Sequelize.INTEGER,
	complementAddressTo: Sequelize.STRING,
	districtAddressTo: Sequelize.STRING,
	zipcodeAddressTo: Sequelize.INTEGER,
	cityAddressTo: Sequelize.STRING,
	stateAddressTo: Sequelize.STRING,
	referenceAddressTo: Sequelize.STRING,
	locationAddressTo: Sequelize.GEOMETRY('POINT'),
}, {
	modelName: 'delivery',
	tableName: 'deliveries',
	sequelize: conn,
});

export default Delivery;