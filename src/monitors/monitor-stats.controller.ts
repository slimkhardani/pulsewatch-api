import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MonitorsService } from './monitors.service';
import { ChecksService } from '../checks/checks.service';
import { IncidentsService } from '../incidents/incidents.service';

@UseGuards(JwtAuthGuard)
@Controller('monitors/:id/stats')
export class MonitorStatsController {
  constructor(
    private monitorsService: MonitorsService,
    private checksService: ChecksService,
  ) {}

  @Get('uptime')
  async getUptime(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('hours') hours = '24',
  ) {
    await this.monitorsService.findOneForUser(user.userId, id); // ownership check
    return this.checksService.getUptimeStats(id, Number(hours));
  }

  @Get('response-time')
  async getResponseTimeSeries(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('hours') hours = '24',
  ) {
    await this.monitorsService.findOneForUser(user.userId, id);
    return this.checksService.getResponseTimeSeries(id, Number(hours));
  }

  @Get('recent-checks')
  async getRecentChecks(@CurrentUser() user: any, @Param('id') id: string) {
    await this.monitorsService.findOneForUser(user.userId, id);
    return this.checksService.getRecentForMonitor(id, 20);
  }
}