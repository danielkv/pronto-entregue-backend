import Sequelize  from 'sequelize';

export default new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
	host: process.env.MYSQL_HOST,
	define: {
		charset: 'utf8mb4',
		collate: 'utf8mb4_general_ci'
	},
	dialect: 'mysql',
	pool: {
		max: parseInt(process.env.MYSQL_MAX_USER_CONNECTIONS),
		min: 0,
		idle: 5000
	},
	retry: {
		max: 5,
		match: [/max_user_connections/g]
	},
	/* logging(str, object) {
		console.log(object.type, object.where);
	}, */
	timezone: '-03:00'
});