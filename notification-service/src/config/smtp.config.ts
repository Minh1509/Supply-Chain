import { registerAs } from '@nestjs/config';

export default registerAs('smtp', () => ({
  MAIL_DRIVER: process.env.MAIl_DRIVER,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: parseInt(process.env.MAIL_PORT || '465'),
  MAIL_USERNAME: process.env.MAIL_USERNAME,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  MAIL_SENDER: process.env.MAIL_SENDER || 'minh.nguyen25@sotatek.com',
  MAIL_SECURE: process.env.MAIL_SECURE === 'true',
}));
