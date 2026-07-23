import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Monitor } from '../monitors/monitor.entity';

export enum UserPlan {
  FREE = 'free',
  PRO = 'pro',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserPlan, default: UserPlan.FREE })
  plan: UserPlan;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Monitor, (monitor) => monitor.user)
  monitors: Monitor[];

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column({ nullable: true })
stripeSubscriptionId: string;
}