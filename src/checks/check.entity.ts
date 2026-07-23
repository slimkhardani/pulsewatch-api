import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Monitor } from '../monitors/monitor.entity';

@Entity('checks')
@Index(['monitor', 'checkedAt'])
export class Check {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Monitor, (monitor) => monitor.checks, { onDelete: 'CASCADE' })
  monitor: Monitor;

  @Column({ type: 'int', nullable: true })
  statusCode: number | null;

  @Column({ nullable: true })
  responseTimeMs: number;

  @Column()
  success: boolean;

  @CreateDateColumn()
  checkedAt: Date;
}