import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Monitor } from './monitor.entity';
import { MonitorsService } from './monitors.service';
import { MonitorsController } from './monitors.controller';
import { MonitorStatsController } from './monitor-stats.controller';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { ChecksModule } from '../checks/checks.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Monitor]),
    forwardRef(() => MonitoringModule),
    ChecksModule,
    UsersModule,
  ],
  providers: [MonitorsService],
  controllers: [MonitorsController, MonitorStatsController],
  exports: [MonitorsService],
})
export class MonitorsModule {}