import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('chat_logs')
@Index(['userId', 'createdAt'])
@Index(['intent', 'createdAt'])
export class ChatLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userRole: string;

  @Column({ type: 'text' })
  userMessage: string;

  @Column({ type: 'text' })
  botResponse: string;

  @Column({ nullable: true })
  intent: string;

  @Column({ type: 'jsonb', nullable: true })
  entities: Record<string, any>;

  @Column({ type: 'int' })
  responseTime: number;

  @Column({ default: true })
  success: boolean;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
