import * as path from 'path';
import { databaseConfig } from 'src/config/database.config';
import { DataSource, DataSourceOptions } from 'typeorm';

const dataSourceOptions: DataSourceOptions = {
  ...(databaseConfig as any),
  migrations: [path.join(__dirname, 'src/database/migration/*.{js,ts}')],
  seeds: [path.join(__dirname, 'src/database/seeders/*.{js,ts}')],
  cli: {
    entitiesDir: 'src',
    migrationDir: 'src/database/migration',
    subscribersDir: 'src',
  },
} as DataSourceOptions;

export const AppDataSource = new DataSource(dataSourceOptions);
export default dataSourceOptions;
