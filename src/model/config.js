import Sequelize from 'sequelize';

import conn from '../services/connection';

class Config extends Sequelize.Model {}
Config.init({
	key: Sequelize.STRING,
	value: Sequelize.STRING,
}, {
	timestamps: false,
	modelName: 'config',
	tableName: 'config',
	sequelize: conn,
});

export default Config;