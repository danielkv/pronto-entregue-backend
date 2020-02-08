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
	valueType: {
		type: Sequelize.ENUM('value', 'percentage'),
		defaultValue: 'percentage',
		allowNull: false
	},
	value: Sequelize.FLOAT,
}, {
	modelName: 'campaign',
	tableName: 'campaigns',
	sequelize: conn,
});

export default Campaign;