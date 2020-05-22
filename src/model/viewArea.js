import Sequelize  from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de locais de entrega
 */

class ViewArea extends Sequelize.Model {}

ViewArea.init({
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
}, {
	modelName: 'viewArea',
	tableName: 'view_areas',
	sequelize: conn,
});

export default ViewArea;