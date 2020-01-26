import Sequelize from 'sequelize';

import conn from '../services/connection';

class Campaign extends Sequelize.Model {}
Campaign.init({
	name: Sequelize.STRING,
	image: Sequelize.TEXT,
	startsAt: Sequelize.DATE,
	expiresAt: Sequelize.DATE,
	description: Sequelize.STRING,
	masterOnly: {
		comment: 'Se verdadeiro, apenas usuário master consegue alterar',
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	},
	chargeCompany: {
		comment: 'Desconto/Cashback deve ser cobrada da(s) empresas',
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	},
	acceptOtherCampaign: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	},
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
	modelName: 'campaign',
	tableName: 'campaigns',
	sequelize: conn,
});

export default Campaign;