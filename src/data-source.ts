import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './users/user.entity';
import { Monitor } from './monitors/monitor.entity';
import { Check } from './checks/check.entity';
import { Incident } from './incidents/incident.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Monitor, Check, Incident],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});