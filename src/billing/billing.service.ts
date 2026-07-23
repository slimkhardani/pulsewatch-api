import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';
import { UserPlan } from '../users/user.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class BillingService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

  constructor(private usersService: UsersService) {}

  async createCheckoutSession(userId: string, userEmail: string) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
      metadata: { userId },
    });
    return { url: session.url };
  }

  async handleWebhookEvent(rawBody: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || '',
    );

    if (event.type === 'checkout.session.completed') {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId;
  if (userId) {
    await this.usersService.updatePlan(userId, UserPlan.PRO, session.customer as string);
    await this.usersService.setSubscriptionId(userId, session.subscription as string);
  }
}

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await this.usersService.findByStripeCustomerId(subscription.customer as string);
      if (user) {
        await this.usersService.updatePlan(user.id, UserPlan.FREE, null);
      }
    }

    return { received: true };
  }

  async cancelSubscription(userId: string) {
  const user = await this.usersService.findById(userId);
  if (!user || !user.stripeSubscriptionId) {
    throw new NotFoundException('No active subscription found');
  }
  await this.stripe.subscriptions.cancel(user.stripeSubscriptionId);
  return { cancelled: true };
}
}