import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private resend = new Resend(process.env.RESEND_API_KEY);

  private wrapTemplate(title: string, bodyHtml: string, accentColor: string) {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; padding: 40px 20px;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #171717; border: 1px solid #262626; border-radius: 12px; overflow: hidden;">
          <div style="background-color: ${accentColor}; padding: 24px 32px;">
            <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">PulseWatch</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 20px; font-weight: 600;">${title}</h2>
            <div style="color: #a3a3a3; font-size: 14px; line-height: 1.6;">
              ${bodyHtml}
            </div>
          </div>
          <div style="padding: 20px 32px; border-top: 1px solid #262626;">
            <p style="margin: 0; color: #525252; font-size: 12px;">You're receiving this because you have an account on PulseWatch.</p>
          </div>
        </div>
      </div>
    `;
  }

  private button(url: string, label: string, color: string) {
    return `<a href="${url}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: ${color}; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">${label}</a>`;
  }

  async sendDownAlert(userEmail: string, monitorName: string, url: string, cause: string) {
    try {
      const html = this.wrapTemplate(
        `🔴 ${monitorName} is down`,
        `<p>We detected that your monitor <strong style="color:#fff">${monitorName}</strong> (${url}) is currently unreachable.</p>
         <p style="margin-top: 12px;"><strong style="color:#fff">Reason:</strong> ${cause}</p>`,
        '#dc2626',
      );
      await this.resend.emails.send({
        from: process.env.ALERT_EMAIL_FROM || 'PulseWatch <onboarding@resend.dev>',
        to: userEmail,
        subject: `🔴 ${monitorName} is DOWN`,
        html,
      });
      this.logger.log(`Down alert sent to ${userEmail} for ${monitorName}`);
    } catch (err) {
      this.logger.error(`Failed to send down alert: ${err.message}`);
    }
  }

  async sendRecoveryAlert(userEmail: string, monitorName: string, url: string) {
    try {
      const html = this.wrapTemplate(
        `🟢 ${monitorName} is back up`,
        `<p>Good news — your monitor <strong style="color:#fff">${monitorName}</strong> (${url}) has recovered and is responding normally again.</p>`,
        '#16a34a',
      );
      await this.resend.emails.send({
        from: process.env.ALERT_EMAIL_FROM || 'PulseWatch <onboarding@resend.dev>',
        to: userEmail,
        subject: `🟢 ${monitorName} is back UP`,
        html,
      });
      this.logger.log(`Recovery alert sent to ${userEmail} for ${monitorName}`);
    } catch (err) {
      this.logger.error(`Failed to send recovery alert: ${err.message}`);
    }
  }

  async sendVerificationEmail(userEmail: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    try {
      const html = this.wrapTemplate(
        'Verify your email',
        `<p>Welcome to PulseWatch! Confirm your email address to activate your account and start monitoring your sites.</p>
         ${this.button(link, 'Verify email', '#2563eb')}
         <p style="margin-top: 20px; font-size: 12px; color: #525252;">If the button doesn't work, copy this link: ${link}</p>`,
        '#2563eb',
      );
      await this.resend.emails.send({
        from: process.env.ALERT_EMAIL_FROM || 'PulseWatch <onboarding@resend.dev>',
        to: userEmail,
        subject: 'Verify your PulseWatch email',
        html,
      });
      this.logger.log(`Verification email sent to ${userEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send verification email: ${err.message}`);
    }
  }

  async sendPasswordResetEmail(userEmail: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    try {
      const html = this.wrapTemplate(
        'Reset your password',
        `<p>We received a request to reset your PulseWatch password. This link is valid for 1 hour.</p>
         ${this.button(link, 'Reset password', '#2563eb')}
         <p style="margin-top: 20px; font-size: 12px; color: #525252;">If you didn't request this, you can safely ignore this email.</p>`,
        '#2563eb',
      );
      await this.resend.emails.send({
        from: process.env.ALERT_EMAIL_FROM || 'PulseWatch <onboarding@resend.dev>',
        to: userEmail,
        subject: 'Reset your PulseWatch password',
        html,
      });
      this.logger.log(`Password reset email sent to ${userEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send reset email: ${err.message}`);
    }
  }
}