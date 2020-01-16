import Sequelize from 'sequelize';

import conn from '../services/connection';

class Coupon extends Sequelize.Model {}
Coupon.init({
	code: Sequelize.STRING,
	expiresAt: Sequelize.DATEONLY,
	description: Sequelize.STRING,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
	},
	type: {
		type: Sequelize.STRING,
		defaultValue: 'cashback',
		allowNull: false,
		validate: {
			isIn: [['discount', 'cashback', 'value']],
			notEmpty: { msg: 'Você deve definir um tipo' },
			notNull: { msg: 'Você deve definir um tipo' },
		}
	},
	valueType: {
		type: Sequelize.STRING,
		defaultValue: 'percentage',
		allowNull: false,
		validate: {
			isIn: [['value', 'percentage']],
			notEmpty: { msg: 'Você deve definir um tipo de valor' },
			notNull: { msg: 'Você deve definir um tipo de valor' },
		}
	},
	value: Sequelize.FLOAT,
}, {
	modelName: 'coupon',
	tableName: 'coupons',
	sequelize: conn,
});

export default Coupon;