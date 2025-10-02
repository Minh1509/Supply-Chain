import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL,
  host: process.env.RABBITMQ_HOST || 'localhost',
  port: parseInt(process.env.RABBITMQ_PORT || '5672'),
  queue: process.env.RABBITMQ_QUEUE,
  user: process.env.RABBITMQ_USER,
  pass: process.env.RABBITMQ_PASS,
}));
