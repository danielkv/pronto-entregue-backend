import Redis from 'ioredis';

export default process.env.NODE_ENV === 'production' ? new Redis(process.env.REDIS_URL) : new Redis(6379, 'http://127.0.0.1');