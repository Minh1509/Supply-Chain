import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ConversationEntity } from './conversation.entity';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  conversationId: string;

  @Column({ type: 'enum', enum: MessageRole })
  role: MessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  intent: string;

  @Column({ type: 'jsonb', nullable: true })
  entities: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  responseTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationEntity;
}
