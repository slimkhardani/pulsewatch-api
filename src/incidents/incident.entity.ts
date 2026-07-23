import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Monitor } from '../monitors/monitor.entity';

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Monitor, (monitor) => monitor.incidents, { onDelete: 'CASCADE' })
  monitor: Monitor;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column()
  cause: string;
}