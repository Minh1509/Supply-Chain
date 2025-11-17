import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('metrics')
@Index(['metricType', 'date'])
export class MetricsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  metricType: string;

  @Column()
  metricName: string;

  @Column({ type: 'float' })
  value: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
