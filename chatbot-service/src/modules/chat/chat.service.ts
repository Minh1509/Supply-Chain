import { Injectable, Logger } from '@nestjs/common';
import { ConversationService } from '../conversation/conversation.service';
import { OpenAIService } from '../llm/openai.service';
import { PromptService } from '../llm/prompt.service';
import { ActionExecutorService } from '../action/action-executor.service';
import { ChatMessageDto, ChatResponseDto } from 'src/common/dto/chat.dto';
import { ConversationMessage, IntentResult } from 'src/common/interfaces/chat.interface';
import { ChatIntent } from 'src/common/enums';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly conversationService: ConversationService,
    private readonly openAIService: OpenAIService,
    private readonly promptService: PromptService,
    private readonly actionExecutor: ActionExecutorService,
  ) {}

  async processMessage(dto: ChatMessageDto): Promise<ChatResponseDto> {
    try {
      // 1. Save user message
      const userMessage: ConversationMessage = {
        role: 'user',
        content: dto.message,
        timestamp: new Date(),
        metadata: dto.metadata,
      };

      await this.conversationService.saveMessage(dto.sessionId, userMessage);

      // 2. Get conversation history
      const history = await this.conversationService.getHistory(dto.sessionId);

      // 3. Analyze intent
      const intent = await this.analyzeIntent(dto.message, history);
      this.logger.debug(`Detected intent: ${intent.intent}`);

      // 4. Handle based on intent
      let response: string;
      let additionalData: any = null;

      if (intent.confidence >= 0.7) {
        if (this.isQueryIntent(intent.intent)) {
          // Query information
          const actionResult = await this.handleQuery(intent, dto);
          response = this.formatQueryResponse(actionResult, intent.intent);
          additionalData = actionResult.data;
        } else if (this.isActionIntent(intent.intent)) {
          // Execute action
          const actionResult = await this.handleAction(intent, dto);
          response = actionResult.message;
          additionalData = actionResult.data;
        } else {
          // General conversation with high confidence
          response = await this.handleGeneralConversation(dto.message, history, dto);
        }
      } else {
        // Low confidence - use general conversation with context
        response = await this.handleGeneralConversation(dto.message, history, dto);
      }

      // 5. Save assistant response
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: { intent: intent.intent },
      };

      await this.conversationService.saveMessage(dto.sessionId, assistantMessage);

      // 6. Extend session
      await this.conversationService.extendSession(dto.sessionId);

      return {
        message: response,
        intent: intent.intent,
        data: additionalData,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Lỗi xử lý tin nhắn: ${error.message}`, error.stack);
      return {
        message: 'Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi này. Bạn có thể thử lại hoặc hỏi theo cách khác được không?',
        timestamp: new Date(),
      };
    }
  }

  private async analyzeIntent(message: string, history: ConversationMessage[] = []): Promise<IntentResult> {
    try {
      const result = await this.openAIService.analyzeIntent(message, history);
      return result;
    } catch (error) {
      this.logger.error(`Error analyzing intent: ${error.message}`);
      return {
        intent: ChatIntent.UNKNOWN,
        confidence: 0,
        entities: {},
      };
    }
  }

  private isQueryIntent(intent: string): boolean {
    const queryIntents = [
      ChatIntent.CHECK_INVENTORY,
      ChatIntent.GET_ORDER_STATUS,
      ChatIntent.VIEW_REPORT,
      ChatIntent.FIND_SUPPLIER,
      ChatIntent.FIND_ITEM,
      ChatIntent.CHECK_WAREHOUSE,
    ];
    return queryIntents.includes(intent as ChatIntent);
  }

  private isActionIntent(intent: string): boolean {
    const actionIntents = [
      ChatIntent.CREATE_PURCHASE_ORDER,
      ChatIntent.CREATE_SALES_ORDER,
      ChatIntent.CREATE_RFQ,
      ChatIntent.CREATE_QUOTATION,
      ChatIntent.APPROVE_ORDER,
      ChatIntent.UPDATE_ORDER_STATUS,
    ];
    return actionIntents.includes(intent as ChatIntent);
  }

  private async handleQuery(intent: IntentResult, dto: ChatMessageDto): Promise<any> {
    const actionType = this.mapIntentToAction(intent.intent);
    const params = this.extractParams(intent.entities, dto);

    return await this.actionExecutor.executeAction({
      type: actionType,
      params,
      userId: dto.userId,
      companyId: dto.companyId,
    });
  }

  private async handleAction(intent: IntentResult, dto: ChatMessageDto): Promise<any> {
    const actionType = this.mapIntentToAction(intent.intent);
    const params = this.extractParams(intent.entities, dto);

    const result = await this.actionExecutor.executeAction({
      type: actionType,
      params,
      userId: dto.userId,
      companyId: dto.companyId,
    });

    if (result.success) {
      return {
        success: true,
        message: this.promptService.formatSuccessMessage(intent.intent, result.data),
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: this.promptService.formatErrorMessage(result.error || 'Action failed'),
        error: result.error,
      };
    }
  }

  private async handleGeneralConversation(
    message: string,
    history: ConversationMessage[],
    dto: ChatMessageDto,
  ): Promise<string> {
    // Enhanced system prompt for handling any question
    const systemPrompt = this.promptService.getSystemPrompt({
      companyId: dto.companyId?.toString(),
      userId: dto.userId?.toString(),
    }) + `

**Hướng dẫn xử lý câu hỏi:**
1. Nếu là câu hỏi về chuỗi cung ứng: Trả lời dựa trên dữ liệu hệ thống
2. Nếu là câu hỏi chung: Trả lời một cách hữu ích và thân thiện
3. Nếu là câu chào, cảm ơn: Phản hồi lịch sự, tự nhiên
4. Nếu không hiểu: Hỏi lại để làm rõ

**Luôn nhớ:**
- Trả lời bằng tiếng Việt tự nhiên
- Giữ thái độ chuyên nghiệp nhưng thân thiện
- Cung cấp thông tin hữu ích nhất có thể`;

    const messages: ConversationMessage[] = [
      ...history,
      { role: 'user' as const, content: message, timestamp: new Date() },
    ];

    return await this.openAIService.generateResponse(messages, systemPrompt);
  }

  private mapIntentToAction(intent: string): string {
    const mapping: Record<string, string> = {
      [ChatIntent.CHECK_INVENTORY]: 'check_inventory',
      [ChatIntent.GET_ORDER_STATUS]: 'get_purchase_order', // or sales_order
      [ChatIntent.FIND_ITEM]: 'get_item',
      [ChatIntent.CHECK_WAREHOUSE]: 'get_all_warehouses',
      [ChatIntent.CREATE_PURCHASE_ORDER]: 'create_purchase_order',
      [ChatIntent.CREATE_SALES_ORDER]: 'create_sales_order',
      [ChatIntent.CREATE_RFQ]: 'create_rfq',
      [ChatIntent.CREATE_QUOTATION]: 'create_quotation',
    };

    return mapping[intent] || 'unknown';
  }

  private extractParams(
    entities: Record<string, any>,
    dto: ChatMessageDto,
  ): Record<string, any> {
    const params: Record<string, any> = {
      companyId: dto.companyId,
      userId: dto.userId,
    };

    // Extract common entities
    if (entities.itemId) params.itemId = entities.itemId;
    if (entities.warehouseId) params.warehouseId = entities.warehouseId;
    if (entities.orderId) params.orderId = entities.orderId;
    if (entities.orderCode) params.orderCode = entities.orderCode;
    if (entities.poId) params.poId = entities.poId;
    if (entities.soId) params.soId = entities.soId;
    if (entities.rfqId) params.rfqId = entities.rfqId;
    if (entities.quotationId) params.quotationId = entities.quotationId;

    return params;
  }

  private formatQueryResponse(result: any, intent?: string): string {
    if (result.success && result.data) {
      return this.promptService.formatResponseTemplate(result.data, intent || 'general');
    } else {
      return 'Mình chưa tìm thấy thông tin bạn cần. Bạn có thể cung cấp thêm chi tiết hoặc thử hỏi theo cách khác được không?';
    }
  }

  private formatListData(data: any[]): string {
    return data
      .slice(0, 5) // Show first 5 items
      .map((item, index) => `${index + 1}. ${this.formatItem(item)}`)
      .join('\n');
  }

  private formatItem(item: any): string {
    if (item.name) return item.name;
    if (item.code) return item.code;
    if (item.id) return `ID: ${item.id}`;
    return JSON.stringify(item);
  }

  private formatObjectData(data: any): string {
    if (!data) return 'Không tìm thấy dữ liệu';

    const lines: string[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'object') {
        lines.push(`${key}: ${value}`);
      }
    }

    return lines.join('\n');
  }

  async getHistory(sessionId: string, limit?: number): Promise<ConversationMessage[]> {
    return await this.conversationService.getHistory(sessionId, limit);
  }

  async clearHistory(sessionId: string): Promise<void> {
    return await this.conversationService.clearHistory(sessionId);
  }
}
