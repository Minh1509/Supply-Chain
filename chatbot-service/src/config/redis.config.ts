import { registerAs } from '@nestjs/config';

export const getRedisConfig = () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: +process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: +process.env.REDIS_DB || 0,
});

export default registerAs('redis', getRedisConfig);
