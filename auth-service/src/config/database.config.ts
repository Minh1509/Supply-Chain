import { registerAs } from '@nestjs/config';
import 'dotenv/config';
import path from 'path';
import { LogLevel } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const databaseConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || '',
  type: (process.env.DB_CONNECTION as any) || 'postgres',
  schema: process.env.DB_SCHEMA || 'public',
  synchronize: false,
  poolSize: 10,
  namingStrategy: new SnakeNamingStrategy(),
  timezone: 'local',
  logging: ['error'] as LogLevel[],
  entities: [path.join(__dirname, '../../src/entities/**/*.entity{.ts,.js}')],
};

export default registerAs('database', () => databaseConfig);
