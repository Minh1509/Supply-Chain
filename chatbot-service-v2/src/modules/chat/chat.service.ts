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

      if (enrichedEntities.itemId) {
        await this.contextService.addToRecentItems(conversationId, enrichedEntities.itemId);
      }
      if (enrichedEntities.warehouseId) {
        await this.contextService.addToRecentWarehouses(
          conversationId,
          enrichedEntities.warehouseId,
        );
      }

      await this.contextService.updateContext(conversationId, {
        lastIntent: intent,
        lastEntities: enrichedEntities,
      });

      const context = await this.ragService.retrieve(dto.message, intent);

      let realtimeData = null;
      if (this.needsRealtimeData(intent)) {
        realtimeData = await this.actionExecutor.fetchData(intent, enrichedEntities);
      }

      const history = await this.conversationService.getConversationHistory(conversationId, 10);

      let personalizedPrompt = '';
      if (dto.userId && dto.userRole) {
        personalizedPrompt = await this.personalizationService.getPersonalizedPrompt(
          dto.userId,
          dto.userRole,
        );
      }

      const response = await this.ragService.generate({
        query: dto.message,
        context,
        realtimeData,
        intent,
        history: history.map((m) => ({ role: m.role, content: m.content })),
        personalizedPrompt,
      });

      const responseTime = Date.now() - startTime;

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
