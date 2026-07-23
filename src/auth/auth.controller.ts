import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { UsersService } from '../users/users.service';
import { Body, Controller, Post, Get, UseGuards, NotFoundException } from '@nestjs/common';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
forgotPassword(@Body() dto: ForgotPasswordDto) {
  return this.authService.forgotPassword(dto.email);
}

@Post('reset-password')
resetPassword(@Body() dto: ResetPasswordDto) {
  return this.authService.resetPassword(dto.token, dto.newPassword);
}

@Post('resend-verification')
resendVerification(@Body() dto: ResendVerificationDto) {
  return this.authService.resendVerification(dto.email);
}

  @UseGuards(JwtAuthGuard)
@Get('me')
async me(@CurrentUser() user: any) {
  const fullUser = await this.usersService.findById(user.userId);
  if (!fullUser) {
    throw new NotFoundException('User not found');
  }
  return { id: fullUser.id, email: fullUser.email, plan: fullUser.plan };
}
}