import Redis from 'ioredis';

const redisService = new Redis({
	host: process.env.REDISCLOUD_URL,
	maxRetriesPerRequest: 5,
	reconnectOnError: function (err) {
		var targetError = "READONLY";
		if (err.message.includes(targetError)) {
			// Only reconnect when the error contains "READONLY"
			return true; // or `return 1;`
		}
	},
});

//redisService.del();

export default redisService;