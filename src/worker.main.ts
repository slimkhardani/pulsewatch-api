import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Monitor } from './monitors/monitor.entity';
import { Check } from './checks/check.entity';
import { Incident } from './incidents/incident.entity';
import { MonitorsModule } from './monitors/monitors.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ChecksModule } from './checks/checks.module';
import { IncidentsModule } from './incidents/incidents.module';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ...(process.env.DATABASE_URL
        ? {}
        : {
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT || '5432', 10),
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
          }),
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
      entities: [User, Monitor, Check, Incident],
      synchronize: false,
    }),
    MonitorsModule,
    MonitoringModule,
    ChecksModule,
    IncidentsModule,
    AlertsModule,
  ],
})
class WorkerAppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerAppModule);
  console.log('Worker process started');
}
bootstrap();