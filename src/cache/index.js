import sequelizeCache from 'sequelize-transparent-cache';
import RedisAdaptor from 'sequelize-transparent-cache-ioredis';

import redis from '../services/redis';
import { namespace } from './keys';

const adaptor = new RedisAdaptor({
	client: redis,
	namespace, // optional
	lifetime: 60*15    // optional - 15 minutos
})

export default sequelizeCache(adaptor);

export async function cleanKeys(match) {
	const keys = await redis.keys(match);
	
	return await Promise.all(keys.map(key => redis.del(key)))
	
}