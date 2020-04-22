import sequelizeCache from 'sequelize-transparent-cache';
import RedisAdaptor from 'sequelize-transparent-cache-ioredis';

import redis from '../services/redis';

const adaptor = new RedisAdaptor({
	client: redis,
	namespace: 'model', // optional
	lifetime: 10   // optional
})

export default sequelizeCache(adaptor);