const redisConfig = {};

if (process.env.NODE_ENV === 'production') {
	redisConfig.host = 'redisdb.tzx2ao.ng.0001.sae1.cache.amazonaws.com';
	redisConfig.port = 6379;
} else if (process.env.NODE_ENV === 'staging') {
	redisConfig.host = 'redisdb.tzx2ao.ng.0001.sae1.cache.amazonaws.com';
	redisConfig.port = 6379;
} else {
	redisConfig.host = process.env.REDISCLOUD_URL;
	redisConfig.port = 6379;
}

export default redisConfig;