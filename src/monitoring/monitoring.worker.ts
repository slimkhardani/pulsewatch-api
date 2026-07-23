import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import { ChecksService } from '../checks/checks.service';
import { IncidentsService } from '../incidents/incidents.service';
import { pingUrl } from './ping.util';
import { MonitorsService } from '../monitors/monitors.service';
import { AlertsService } from '../alerts/alerts.service';
import { MonitoringGateway } from './monitoring.gateway';
import { MONITOR_QUEUE } from './monitoring.module';

const FAILURE_THRESHOLD = 2;

@Injectable()
export class MonitoringWorker implements OnModuleInit {
  private consecutiveFailures = new Map<string, number>();

  constructor(
    private checksService: ChecksService,
    private incidentsService: IncidentsService,
    private monitorsService: MonitorsService,
    private alertsService: AlertsService,
    private gateway: MonitoringGateway,
  ) {}

  onModuleInit() {
    new Worker(
      MONITOR_QUEUE,
      async (job) => {
        const { monitorId } = job.data;
        const monitor = await this.monitorsService.findById(monitorId);
        if (!monitor || !monitor.isActive) return;

        const result = await pingUrl(monitor.url);

        const check = await this.checksService.create(monitorId, {
          statusCode: result.statusCode,
          responseTimeMs: result.responseTimeMs,
          success: result.success,
        });

        // Broadcast the check result live
        this.gateway.emitCheckResult(monitorId, {
          success: result.success,
          responseTimeMs: result.responseTimeMs,
          statusCode: result.statusCode,
          checkedAt: check.checkedAt,
        });

        const openIncident = await this.incidentsService.findOpenForMonitor(monitorId);

        if (!result.success) {
          const fails = (this.consecutiveFailures.get(monitorId) || 0) + 1;
          this.consecutiveFailures.set(monitorId, fails);

          if (fails >= FAILURE_THRESHOLD && !openIncident) {
            await this.incidentsService.open(monitorId, result.cause || 'Unknown failure');
            console.log(`🔴 Incident opened for monitor ${monitorId}: ${result.cause}`);

            this.gateway.emitIncidentUpdate(monitorId, { status: 'down', cause: result.cause });

            if (monitor.user?.email) {
              await this.alertsService.sendDownAlert(monitor.user.email, monitor.name, monitor.url, result.cause || 'Unknown failure');
            }
          }
        } else {
          this.consecutiveFailures.set(monitorId, 0);
          if (openIncident) {
            await this.incidentsService.resolve(openIncident.id);
            console.log(`🟢 Incident resolved for monitor ${monitorId}`);

            this.gateway.emitIncidentUpdate(monitorId, { status: 'up' });

            if (monitor.user?.email) {
              await this.alertsService.sendRecoveryAlert(monitor.user.email, monitor.name, monitor.url);
            }
          }
        }
      },
      {
        connection: process.env.REDIS_URL
          ? { url: process.env.REDIS_URL }
          : { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
      },
    );
  }
}