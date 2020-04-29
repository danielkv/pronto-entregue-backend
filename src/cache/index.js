//import NodeCache from 'node-cache';
import sequelizeCache from 'sequelize-transparent-cache';
import RedisAdaptor from 'sequelize-transparent-cache-ioredis';

import redis from '../services/redis';
//import MemoryAdaptor from './adaptor';
import { namespace } from './keys';

const adaptor = new RedisAdaptor({
	client: redis,
	namespace, // optional
	lifetime: 60*15    // optional - 15 minutos
})

export async function deleteMatch(match) {
	const keys = await redis.keys(`*${match}*`);
	return await redis.del(keys);
}

export async function flushAll() {
	return await redis.flushall();
}
export default sequelizeCache(adaptor);