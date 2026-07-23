import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserPlan } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async updatePlan(userId: string, plan: UserPlan, stripeCustomerId: string | null) {
  const updateData: any = { plan };
  if (stripeCustomerId !== undefined) {
    updateData.stripeCustomerId = stripeCustomerId ?? undefined;
  }
  await this.usersRepo.update(userId, updateData);
}

findByStripeCustomerId(stripeCustomerId: string) {
  return this.usersRepo.findOne({ where: { stripeCustomerId } });
}

async create(email: string, passwordHash: string, verificationToken?: string) {
  const user = this.usersRepo.create({
    email,
    passwordHash,
    emailVerificationToken: verificationToken,
  });
  return this.usersRepo.save(user);
}

findByVerificationToken(token: string) {
  return this.usersRepo.findOne({ where: { emailVerificationToken: token } });
}

async markEmailVerified(userId: string) {
  await this.usersRepo.update(userId, { isEmailVerified: true, emailVerificationToken: undefined });
}

async setPasswordResetToken(userId: string, token: string, expires: Date) {
  await this.usersRepo.update(userId, { passwordResetToken: token, passwordResetExpires: expires });
}

findByResetToken(token: string) {
  return this.usersRepo.findOne({ where: { passwordResetToken: token } });
}

async updatePassword(userId: string, passwordHash: string) {
  await this.usersRepo.update(userId, {
    passwordHash,
    passwordResetToken: undefined,
    passwordResetExpires: undefined,
  });
}
async setSubscriptionId(userId: string, subscriptionId: string) {
  await this.usersRepo.update(userId, { stripeSubscriptionId: subscriptionId });
}

async setVerificationToken(userId: string, token: string) {
  await this.usersRepo.update(userId, { emailVerificationToken: token });
}
}