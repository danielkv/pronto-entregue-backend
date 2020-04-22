import Redis from 'ioredis';

const redisService = process.env.NODE_ENV === 'production' ? new Redis(process.env.REDIS_URL) : new Redis();

//redisService.del();

export default redisService;