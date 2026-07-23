import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(@CurrentUser() user: any) {
    return this.billingService.createCheckoutSession(user.userId, user.email);
  }

  @UseGuards(JwtAuthGuard)
@Post('cancel')
async cancel(@CurrentUser() user: any) {
  return this.billingService.cancelSubscription(user.userId);
}

  @Post('webhook')
async webhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
  const signature = req.headers['stripe-signature'] as string;
  if (!req.rawBody) {
    return res.status(400).send('Missing raw body');
  }
  try {
    await this.billingService.handleWebhookEvent(req.rawBody, signature);
    res.status(200).send({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
}