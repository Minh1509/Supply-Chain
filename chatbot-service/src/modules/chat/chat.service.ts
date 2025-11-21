import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ChatRequestDto, ChatResponseDto } from '../../common/dto/chat.dto';
import { IntentService } from '../intent/intent.service';
import { ConversationService } from '../conversation/conversation.service';
import { ConversationContextService } from '../conversation/conversation-context.service';
import { PersonalizationService } from '../personalization/personalization.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { MessageRole } from '../conversation/entities/message.entity';
import { RagService } from '../rag/rag.service';
import { ActionExecutorService } from '../actions/action-executor.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly intentService: IntentService,
    private readonly ragService: RagService,
    private readonly actionExecutor: ActionExecutorService,
    private readonly conversationService: ConversationService,
    private readonly contextService: ConversationContextService,
    private readonly personalizationService: PersonalizationService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async processMessage(dto: ChatRequestDto): Promise<ChatResponseDto> {
    const startTime = Date.now();
    let conversationId = dto.conversationId;
    let success = true;
    let errorMessage: string = null;

    try {
      if (!conversationId) {
        const conversation = await this.conversationService.createConversation({
          userId: dto.userId,
          userRole: dto.userRole,
        });
        conversationId = conversation.id;
      }

      await this.conversationService.addMessage({
        conversationId,
        role: MessageRole.USER,
        content: dto.message,
      });

      const { intent, entities } = await this.intentService.classify(dto.message);

      const enrichedEntities = await this.contextService.inferMissingEntities(
        conversationId,
        entities,
      );

      // Parallel context updates
      await Promise.all([
        enrichedEntities.itemId
          ? this.contextService.addToRecentItems(conversationId, enrichedEntities.itemId)
          : Promise.resolve(),
        enrichedEntities.warehouseId
          ? this.contextService.addToRecentWarehouses(conversationId, enrichedEntities.warehouseId)
          : Promise.resolve(),
        this.contextService.updateContext(conversationId, {
          lastIntent: intent,
          lastEntities: enrichedEntities,
        }),
      ]);

      // Parallel fetch: context, realtime data, history, personalization
      const [context, realtimeData, history, personalizedPrompt] = await Promise.all([
        this.ragService.retrieve(dto.message, intent),
        this.needsRealtimeData(intent)
          ? this.actionExecutor.fetchData(intent, enrichedEntities)
          : Promise.resolve(null),
        this.conversationService.getConversationHistory(conversationId, 10),
        dto.userId && dto.userRole
          ? this.personalizationService.getPersonalizedPrompt(dto.userId, dto.userRole)
          : Promise.resolve(''),
      ]);

      const response = await this.ragService.generate({
        query: dto.message,
        context,
        realtimeData,
        intent,
        history: history.map((m) => ({ role: m.role, content: m.content })),
        personalizedPrompt,
      });

      const responseTime = Date.now() - startTime;

      // Log response time
      if (responseTime > 5000) {
        console.warn(`⚠️ Slow response: ${responseTime}ms for intent ${intent}`);
      } else {
        console.log(`✅ Response time: ${responseTime}ms for intent ${intent}`);
      }

      await this.conversationService.addMessage({
        conversationId,
        role: MessageRole.ASSISTANT,
        content: response,
        intent,
        entities: enrichedEntities,
        responseTime,
      });

      await this.analyticsService.logChat({
        conversationId,
        userId: dto.userId,
        userRole: dto.userRole,
        userMessage: dto.message,
        botResponse: response,
        intent,
        entities: enrichedEntities,
        responseTime,
        success: true,
      });

      return {
        conversationId,
        message: response,
        intent,
        entities: enrichedEntities,
        timestamp: new Date(),
      };
    } catch (error) {
      success = false;
      errorMessage = error.message;

      await this.analyticsService.logChat({
        conversationId: conversationId || 'unknown',
        userId: dto.userId,
        userRole: dto.userRole,
        userMessage: dto.message,
        botResponse: 'Xin lỗi, đã có lỗi xảy ra.',
        responseTime: Date.now() - startTime,
        success: false,
        errorMessage,
      });

      throw error;
    }
  }

  private needsRealtimeData(intent: string): boolean {
    return ['QUERY_INVENTORY', 'QUERY_ORDER', 'QUERY_MANUFACTURE', 'REPORT'].includes(intent);
  }
}
