import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_KEYS } from 'src/common/constants';
import {
  ConversationContext,
  ConversationMessage,
} from 'src/common/interfaces/chat.interface';

@Injectable()
export class ConversationService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {}

  async saveMessage(sessionId: string, message: ConversationMessage): Promise<void> {
    const key = REDIS_KEYS.CONVERSATION_HISTORY(sessionId);
    const maxHistory = this.configService.get('session.maxConversationHistory');
    const expiry = this.configService.get('session.expirySeconds');

    // Add message to list
    await this.redisClient.lpush(key, JSON.stringify(message));

    // Trim to max history
    await this.redisClient.ltrim(key, 0, maxHistory - 1);

    // Set expiry
    await this.redisClient.expire(key, expiry);
  }

  async getHistory(sessionId: string, limit?: number): Promise<ConversationMessage[]> {
    const key = REDIS_KEYS.CONVERSATION_HISTORY(sessionId);
    const maxHistory = limit || this.configService.get('session.maxConversationHistory');

    const messages = await this.redisClient.lrange(key, 0, maxHistory - 1);

    return messages.map((msg) => JSON.parse(msg)).reverse();
  }

  async clearHistory(sessionId: string): Promise<void> {
    const key = REDIS_KEYS.CONVERSATION_HISTORY(sessionId);
    await this.redisClient.del(key);
  }

  async saveContext(
    sessionId: string,
    context: Partial<ConversationContext>,
  ): Promise<void> {
    const key = REDIS_KEYS.SESSION_DATA(sessionId);
    const expiry = this.configService.get('session.expirySeconds');

    await this.redisClient.setex(key, expiry, JSON.stringify(context));
  }

  async getContext(sessionId: string): Promise<ConversationContext | null> {
    const key = REDIS_KEYS.SESSION_DATA(sessionId);
    const data = await this.redisClient.get(key);

    return data ? JSON.parse(data) : null;
  }

  async extendSession(sessionId: string): Promise<void> {
    const expiry = this.configService.get('session.expirySeconds');
    const historyKey = REDIS_KEYS.CONVERSATION_HISTORY(sessionId);
    const contextKey = REDIS_KEYS.SESSION_DATA(sessionId);

    await this.redisClient.expire(historyKey, expiry);
    await this.redisClient.expire(contextKey, expiry);
  }
}
