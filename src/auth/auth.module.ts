import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    AlertsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'slimosslimos31122003',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}