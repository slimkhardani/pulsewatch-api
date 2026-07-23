import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Incident } from './incident.entity';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private incidentsRepo: Repository<Incident>,
  ) {}

  findOpenForMonitor(monitorId: string) {
    return this.incidentsRepo.findOne({
      where: { monitor: { id: monitorId }, resolvedAt: IsNull() },
    });
  }

  async open(monitorId: string, cause: string) {
    const incident = this.incidentsRepo.create({
      monitor: { id: monitorId } as any,
      cause,
    });
    return this.incidentsRepo.save(incident);
  }

  async resolve(incidentId: string) {
    await this.incidentsRepo.update(incidentId, { resolvedAt: new Date() });
  }
}