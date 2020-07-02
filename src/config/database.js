const databaseConfig = {
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
	logging(str, object) {
		console.log('\n', str);
	},
	timezone: '-03:00',
};

databaseConfig.database = process.env.MYSQL_DB;
databaseConfig.user = process.env.MYSQL_USER;
databaseConfig.password = process.env.MYSQL_PASSWORD;

databaseConfig.host = process.env.MYSQL_HOST;

if (process.env.NODE_ENV === 'production') {
	databaseConfig.logging = false;
} /*else if (process.env.NODE_ENV === 'staging') {
	
} else {
	
} */

export default databaseConfig;