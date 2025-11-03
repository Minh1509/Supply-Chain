import { registerAs } from '@nestjs/config';

export const getRabbitmqConfig = () => ({
  url: process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5666',
  queue: process.env.RABBITMQ_QUEUE || 'chatbot_queue',
  authQueue: process.env.AUTH_SERVICE_QUEUE || 'auth_queue',
  businessQueue: process.env.BUSINESS_SERVICE_QUEUE || 'business_queue',
  generalQueue: process.env.GENERAL_SERVICE_QUEUE || 'general_queue',
  inventoryQueue: process.env.INVENTORY_SERVICE_QUEUE || 'inventory_queue',
  operationQueue: process.env.OPERATION_SERVICE_QUEUE || 'operation_queue',
});

export default registerAs('rabbitmq', getRabbitmqConfig);
