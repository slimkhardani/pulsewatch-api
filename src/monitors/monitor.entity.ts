import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Check } from '../checks/check.entity';
import { Incident } from '../incidents/incident.entity';

@Entity('monitors')
export class Monitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.monitors, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ default: 300 })
  intervalSeconds: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Check, (check) => check.monitor)
  checks: Check[];

  @OneToMany(() => Incident, (incident) => incident.monitor)
  incidents: Incident[];
}