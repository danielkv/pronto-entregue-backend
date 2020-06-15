import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

import { ORDER_CREATED } from '../controller/order';

const host = process.env.NODE_ENV === 'production' ? 'redisdb.tzx2ao.ng.0001.sae1.cache.amazonaws.com' : process.env.REDISCLOUD_URL;
const port = 6379;

const options = {
	host,
	port,
	retryStrategy: times => {
		// reconnect after
		return Math.min(times * 50, 2000);
	}
};

const pubsub = new RedisPubSub({
	reviver(key, value){
		const isISO8601Z = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;

		switch (key) {
			case 'createdAt':
			case 'updatedAt':
				if (typeof value === 'string' && isISO8601Z.test(value)) {
					const tempDateNumber = Date.parse(value);
					if (!isNaN(tempDateNumber)) {
						return new Date(tempDateNumber);
					}
				}
				return value;
			default:
				return value;
		}
	},
	publisher: new Redis(options),
	subscriber: new Redis(options)
});

export default pubsub;