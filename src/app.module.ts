import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Monitor } from './monitors/monitor.entity';
import { Check } from './checks/check.entity';
import { Incident } from './incidents/incident.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MonitorsModule } from './monitors/monitors.module';
import { ChecksModule } from './checks/checks.module';
import { IncidentsModule } from './incidents/incidents.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AlertsModule } from './alerts/alerts.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Monitor, Check, Incident],
      synchronize: false, // dev only — auto-creates tables. We'll switch to migrations before deploy.
    }),
    AuthModule,
    UsersModule,
    MonitorsModule,
    ChecksModule,
    IncidentsModule,
    MonitoringModule,
    AlertsModule,
    BillingModule,
  ],
})
export class AppModule {}