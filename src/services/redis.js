import Redis from 'ioredis';

const redisService = new Redis(process.env.REDISCLOUD_URL);

//redisService.del();

export default redisService;