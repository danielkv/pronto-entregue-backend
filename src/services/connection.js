import Sequelize  from 'sequelize';

export default new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
	host: process.env.MYSQL_HOST,
	dialect: 'mysql',
	pool: {
		max: 100,
		min: 0,
		idle: 500
	},
});