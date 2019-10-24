const Sequelize = require('sequelize');

module.exports = new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
	host : process.env.MYSQL_HOST,
	dialect : 'mysql',
	//logging: false,
	pool : {
		max:30,
		min:0,
		idle: 10000,
	},
});