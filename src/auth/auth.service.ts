import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private alertsService: AlertsService,
  ) {}

  async register(email: string, password: string) {
  const existing = await this.usersService.findByEmail(email);

  if (existing) {
    if (existing.isEmailVerified) {
      throw new ConflictException('Email already in use');
    }
    // Account exists but was never verified — resend a fresh verification email
    const newToken = crypto.randomBytes(32).toString('hex');
    await this.usersService.setVerificationToken(existing.id, newToken);
    await this.alertsService.sendVerificationEmail(email, newToken);
    return { message: 'This email is already registered but not verified. We\'ve sent a new verification link to your inbox.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await this.usersService.create(email, passwordHash, verificationToken);

  await this.alertsService.sendVerificationEmail(email, verificationToken);

  return { message: 'Registration successful. Please check your email to verify your account before logging in.' };
}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in. Check your inbox for the verification link.');
    }

    return this.signToken(user.id, user.email);
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) throw new UnauthorizedException('Invalid or expired verification link');

    await this.usersService.markEmailVerified(user.id);
    return { verified: true };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return { sent: true }; // don't reveal whether the email exists

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.usersService.setPasswordResetToken(user.id, resetToken, expires);
    await this.alertsService.sendPasswordResetEmail(email, resetToken);

    return { sent: true };
  }

async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset link');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, passwordHash);
    return { reset: true };
  }

  private signToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async resendVerification(email: string) {
  const user = await this.usersService.findByEmail(email);
  if (!user) return { sent: true }; // don't reveal whether the email exists
  if (user.isEmailVerified) return { sent: true }; // already verified, nothing to do

  const newToken = crypto.randomBytes(32).toString('hex');
  await this.usersService.setVerificationToken(user.id, newToken);
  await this.alertsService.sendVerificationEmail(email, newToken);
  return { sent: true };
}
}