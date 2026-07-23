import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MonitorsService } from './monitors.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';

@UseGuards(JwtAuthGuard)
@Controller('monitors')
export class MonitorsController {
  constructor(private monitorsService: MonitorsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateMonitorDto) {
    return this.monitorsService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.monitorsService.findAllForUser(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.monitorsService.findOneForUser(user.userId, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateMonitorDto) {
    return this.monitorsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.monitorsService.remove(user.userId, id);
  }
}