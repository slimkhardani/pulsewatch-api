import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Check } from './check.entity';

@Injectable()
export class ChecksService {
  constructor(
    @InjectRepository(Check)
    private checksRepo: Repository<Check>,
  ) {}

  create(monitorId: string, data: Partial<Check>) {
    const check = this.checksRepo.create({
      monitor: { id: monitorId } as any,
      ...data,
    });
    return this.checksRepo.save(check);
  }

  getRecentForMonitor(monitorId: string, limit = 20) {
    return this.checksRepo.find({
      where: { monitor: { id: monitorId } },
      order: { checkedAt: 'DESC' },
      take: limit,
    });
  }

  async getUptimeStats(monitorId: string, sinceHours: number) {
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

    const checks = await this.checksRepo.find({
      where: { monitor: { id: monitorId }, checkedAt: MoreThan(since) },
      order: { checkedAt: 'ASC' },
    });

    if (checks.length === 0) {
      return { uptimePercentage: null, avgResponseTimeMs: null, totalChecks: 0 };
    }

    const successCount = checks.filter((c) => c.success).length;
    const uptimePercentage = (successCount / checks.length) * 100;

    const validResponseTimes = checks.filter((c) => c.responseTimeMs != null);
    const avgResponseTimeMs =
      validResponseTimes.reduce((sum, c) => sum + c.responseTimeMs, 0) / validResponseTimes.length;

    return {
      uptimePercentage: Number(uptimePercentage.toFixed(2)),
      avgResponseTimeMs: Math.round(avgResponseTimeMs),
      totalChecks: checks.length,
    };
  }

  async getResponseTimeSeries(monitorId: string, sinceHours: number) {
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);
    return this.checksRepo.find({
      where: { monitor: { id: monitorId }, checkedAt: MoreThan(since) },
      order: { checkedAt: 'ASC' },
      select: {
        checkedAt: true,
        responseTimeMs: true,
        success: true,
      },
    });
  }
}