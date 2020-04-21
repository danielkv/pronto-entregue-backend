import Sequelize  from 'sequelize';

export default new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
	host: process.env.MYSQL_HOST,
	dialect: 'mysql',
	pool: {
		max: parseInt(process.env.MYSQL_MAX_USER_CONNECTIONS),
		min: 0,
		idle: 2000
	},
	//
	timezone: '-03:00'
});