import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { Queue } from 'bullmq';
import { MonitorsService } from '../monitors/monitors.service';

@Injectable()
export class MonitoringScheduler implements OnModuleInit {
  constructor(
    @Inject('MONITOR_QUEUE') private queue: Queue,
    @Inject(forwardRef(() => MonitorsService)) private monitorsService: MonitorsService,
  ) {}

  async onModuleInit() {
    const monitors = await this.monitorsService.findAllActive();
    for (const monitor of monitors) {
      await this.scheduleMonitor(monitor.id, monitor.intervalSeconds);
    }
  }

  async scheduleMonitor(monitorId: string, intervalSeconds: number) {
    await this.queue.add(
      'ping',
      { monitorId },
      {
        repeat: { every: intervalSeconds * 1000 },
        jobId: `monitor-${monitorId}`,
      },
    );
  }

  async unscheduleMonitor(monitorId: string) {
    const repeatableJobs = await this.queue.getRepeatableJobs();
    const job = repeatableJobs.find((j) => j.id === `monitor-${monitorId}`);
    if (job) await this.queue.removeRepeatableByKey(job.key);
  }
}