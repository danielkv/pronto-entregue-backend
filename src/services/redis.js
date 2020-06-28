import Redis from 'ioredis';

//const host = process.env.NODE_ENV === 'production' ? 'redisdb.tzx2ao.ng.0001.sae1.cache.amazonaws.com' : process.env.REDISCLOUD_URL;
const host = process.env.REDISCLOUD_URL;
const port = 6379;

const redisService = new Redis({
	host,
	port,
	maxRetriesPerRequest: 5,
	reconnectOnError: function (err) {
		var targetError = "READONLY";
		if (err.message.includes(targetError)) {
			// Only reconnect when the error contains "READONLY"
			return true; // or `return 1;`
		}
	},
});

redisService.on('error', async (err)=>{
	
	console.error(err);

})

//redisService.del();

export default redisService;