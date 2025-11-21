import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'chatbot_service',
  schema: process.env.DB_SCHEMA || 'public',
  synchronize: false,
  logging: process.env.NODE_ENV === 'production' ? false : ['error', 'warn'],
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  namingStrategy: new SnakeNamingStrategy(),
  poolSize: parseInt(process.env.DB_POOL_SIZE) || (process.env.NODE_ENV === 'production' ? 5 : 10),
  extra: {
    max:
      parseInt(process.env.DB_MAX_CONNECTIONS) || (process.env.NODE_ENV === 'production' ? 5 : 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 3000,
    idleTimeoutMillis: 30000,
    allowExitOnIdle: false,
  },
};

export default registerAs('database', () => databaseConfig);
