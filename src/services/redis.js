import Redis from 'ioredis';

const redisService = process.env.NODE_ENV === 'production' ? new Redis(process.env.REDISCLOUD_URL) : new Redis();

//redisService.del();

export default redisService;