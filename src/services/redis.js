import Redis from 'ioredis';

const redisService = new Redis({ host: process.env.REDISCLOUD_URL });

//redisService.del();

export default redisService;