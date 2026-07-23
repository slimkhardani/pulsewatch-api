import { Module, forwardRef } from '@nestjs/common';
import { Queue } from 'bullmq';
import { MonitorsModule } from '../monitors/monitors.module';
import { ChecksModule } from '../checks/checks.module';
import { IncidentsModule } from '../incidents/incidents.module';
import { AlertsModule } from '../alerts/alerts.module';
import { MonitoringWorker } from './monitoring.worker';
import { MonitoringScheduler } from './monitoring.scheduler';
import { MonitoringGateway } from './monitoring.gateway';

export const MONITOR_QUEUE = 'monitor-queue';

@Module({
  imports: [forwardRef(() => MonitorsModule), ChecksModule, IncidentsModule, AlertsModule],
  providers: [
    {
      provide: 'MONITOR_QUEUE',
      useFactory: () => new Queue(MONITOR_QUEUE, {
        connection: process.env.REDIS_URL
          ? { url: process.env.REDIS_URL }
          : { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
      }),
    },
    MonitoringScheduler,
    MonitoringWorker,
    MonitoringGateway,
  ],
  exports: ['MONITOR_QUEUE', MonitoringScheduler],
})
export class MonitoringModule {}