import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Monitor } from './monitor.entity';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';
import { MonitoringScheduler } from '../monitoring/monitoring.scheduler';
import { UsersService } from '../users/users.service';

@Injectable()
export class MonitorsService {
  constructor(
    @InjectRepository(Monitor)
    private monitorsRepo: Repository<Monitor>,
    @Inject(forwardRef(() => MonitoringScheduler))
    private scheduler: MonitoringScheduler,
    private usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreateMonitorDto) {
  const user = await this.usersService.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }
  const existingCount = await this.monitorsRepo.count({ where: { user: { id: userId } } });

  const limits = { free: 5, pro: 50 };
  const maxAllowed = limits[user.plan] || 5;

  if (existingCount >= maxAllowed) {
    throw new ForbiddenException(`Plan limit reached (${maxAllowed} monitors). Upgrade to add more.`);
  }

  const monitor = this.monitorsRepo.create({
    ...dto,
    user: { id: userId } as any,
  });
  const saved = await this.monitorsRepo.save(monitor);
  await this.scheduler.scheduleMonitor(saved.id, saved.intervalSeconds);
  return saved;
}

  findAllForUser(userId: string) {
    return this.monitorsRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  findAllActive() {
    return this.monitorsRepo.find({ where: { isActive: true } });
  }

  findById(id: string) {
    return this.monitorsRepo.findOne({ where: { id }, relations: { user: true } });
  }

  async findOneForUser(userId: string, monitorId: string) {
    const monitor = await this.monitorsRepo.findOne({
      where: { id: monitorId },
      relations: { user: true },
    });
    if (!monitor) throw new NotFoundException('Monitor not found');
    if (monitor.user.id !== userId) throw new ForbiddenException();
    return monitor;
  }

  async update(userId: string, monitorId: string, dto: UpdateMonitorDto) {
    const monitor = await this.findOneForUser(userId, monitorId);
    Object.assign(monitor, dto);
    const saved = await this.monitorsRepo.save(monitor);
    await this.scheduler.unscheduleMonitor(monitorId);
    if (saved.isActive) {
      await this.scheduler.scheduleMonitor(saved.id, saved.intervalSeconds);
    }
    return saved;
  }

  async remove(userId: string, monitorId: string) {
    const monitor = await this.findOneForUser(userId, monitorId);
    await this.scheduler.unscheduleMonitor(monitorId);
    await this.monitorsRepo.remove(monitor);
    return { deleted: true };
  }
}