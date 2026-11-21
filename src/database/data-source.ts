import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Category } from './entities/category.entity';
import { Transaction } from './entities/transaction.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'finance_management',
  entities: [Category, Transaction],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
};

// Dipakai oleh TypeORM CLI (npm run migration:*)
export default new DataSource(dataSourceOptions);
