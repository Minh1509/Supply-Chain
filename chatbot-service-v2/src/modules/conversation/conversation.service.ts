import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { MessageEntity, MessageRole } from './entities/message.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
  ) {}

  async createConversation(data: {
    userId?: string;
    userName?: string;
    userRole?: string;
    companyId?: number;
  }): Promise<ConversationEntity> {
    const conversation = this.conversationRepo.create({
      userId: data.userId,
      userName: data.userName,
      userRole: data.userRole,
      companyId: data.companyId || 1,
      context: {},
      metadata: {},
      isActive: true,
      lastMessageAt: new Date(),
    });

    return this.conversationRepo.save(conversation);
  }

  async getConversation(conversationId: string): Promise<ConversationEntity> {
    return this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['messages'],
    });
  }

  async addMessage(data: {
    conversationId: string;
    role: MessageRole;
    content: string;
    intent?: string;
    entities?: Record<string, any>;
    metadata?: Record<string, any>;
    responseTime?: number;
  }): Promise<MessageEntity> {
    const message = this.messageRepo.create(data);
    await this.messageRepo.save(message);

    await this.conversationRepo.update(data.conversationId, {
      lastMessageAt: new Date(),
    });

    return message;
  }

  async getConversationHistory(conversationId: string, limit = 10): Promise<MessageEntity[]> {
    return this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async updateConversationContext(
    conversationId: string,
    context: Record<string, any>,
  ): Promise<void> {
    await this.conversationRepo.update(conversationId, { context });
  }

  async getUserConversations(userId: string, limit = 20): Promise<ConversationEntity[]> {
    return this.conversationRepo.find({
      where: { userId, isActive: true },
      order: { lastMessageAt: 'DESC' },
      take: limit,
    });
  }

  async closeConversation(conversationId: string): Promise<void> {
    await this.conversationRepo.update(conversationId, { isActive: false });
  }
}
