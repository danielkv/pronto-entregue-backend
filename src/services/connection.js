import Sequelize  from 'sequelize';

export default new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
	host: process.env.MYSQL_HOST,
	dialect: 'mysql',
	pool: {
<<<<<<< HEAD
		max: process.env.MYSQL_MAX_USER_CONNECTIONS,
=======
		max: process.env.NODE_ENV === 'production' ? 500 : 50,
>>>>>>> 1326f44c96b6373353db2a07ad2b5e13f3399fbe
		min: 0,
		idle: 2000
	},
	//
	timezone: '-03:00'
});