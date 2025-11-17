import { Injectable, Logger } from '@nestjs/common';
import { ConversationService } from '../conversation/conversation.service';
import { OpenAIService } from '../llm/openai.service';
import { PromptService } from '../llm/prompt.service';
import { ActionExecutorService } from '../action/action-executor.service';
import { DataMappingService } from '../data-mapping/data-mapping.service';
import { EntityExtractionService } from '../entity-extraction/entity-extraction.service';
import { DataEnrichmentService } from '../data-enrichment/data-enrichment.service';
import { ChatMessageDto, ChatResponseDto } from 'src/common/dto/chat.dto';
import { ConversationMessage, IntentResult } from 'src/common/interfaces/chat.interface';
import { ChatIntent } from 'src/common/enums';
import { LocalAIService } from '../llm/localai.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly CONFIDENCE_THRESHOLD = 0.7;

  constructor(
    private readonly conversationService: ConversationService,
    private readonly localAIService: LocalAIService,
    private readonly promptService: PromptService,
    private readonly actionExecutor: ActionExecutorService,
    private readonly dataMappingService: DataMappingService,
    private readonly entityExtractionService: EntityExtractionService,
    private readonly dataEnrichmentService: DataEnrichmentService,
  ) {}

  async processMessage(dto: ChatMessageDto): Promise<ChatResponseDto> {
    try {
      const userMessage: ConversationMessage = {
        role: 'user',
        content: dto.message,
        timestamp: new Date(),
        metadata: dto.metadata,
      };

      await this.conversationService.saveMessage(dto.sessionId, userMessage);

      const history = await this.conversationService.getHistory(dto.sessionId);
      const intent = await this.analyzeIntent(dto.message, history);

      this.logger.debug(`Intent: ${intent.intent}, Confidence: ${intent.confidence}`);

      let response: string;
      let additionalData: any = null;

      if (intent.confidence >= this.CONFIDENCE_THRESHOLD) {
        if (this.isQueryIntent(intent.intent)) {
          const result = await this.handleQuery(intent, dto);
          response = await this.formatQueryResponse(result, intent.intent);
          additionalData = result.data;
        } else if (this.isActionIntent(intent.intent)) {
          const result = await this.handleAction(intent, dto);
          response = result.message || result.error || 'Đã xử lý yêu cầu';
          additionalData = result.data;
        } else {
          response = await this.handleGeneralConversation(dto.message, history, dto);
        }
      } else {
        response = await this.handleGeneralConversation(dto.message, history, dto);
      }

      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: { intent: intent.intent, confidence: intent.confidence },
      };

      await this.conversationService.saveMessage(dto.sessionId, assistantMessage);
      await this.conversationService.extendSession(dto.sessionId);

      return {
        message: response,
        intent: intent.intent,
        data: additionalData,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`, error.stack);
      return {
        message:
          'Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi này. Bạn có thể thử lại hoặc hỏi theo cách khác được không?',
        timestamp: new Date(),
      };
    }
  }

  private async analyzeIntent(
    message: string,
    history: ConversationMessage[] = [],
  ): Promise<IntentResult> {
    try {
      const result = await this.localAIService.analyzeIntent(message, history);
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

    const result = await this.actionExecutor.executeAction({
      type: actionType,
      params,
      userId: dto.userId,
      companyId: dto.companyId,
    });

    return result;
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
      const formattedData = this.dataMappingService.mapActionResult(
        result.data,
        actionType,
      );
      return {
        success: true,
        message: formattedData,
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.error || 'Không thể thực hiện hành động này',
      error: result.error,
    };
  }

  private async handleGeneralConversation(
    message: string,
    history: ConversationMessage[],
    dto: ChatMessageDto,
  ): Promise<string> {
    const systemPrompt = this.promptService.getSystemPrompt({
      companyId: dto.companyId?.toString(),
      userId: dto.userId?.toString(),
    });

    const messages: ConversationMessage[] = [
      ...history.slice(-5),
      { role: 'user' as const, content: message, timestamp: new Date() },
    ];

    return await this.localAIService.generateResponse(messages, systemPrompt);
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
    const enrichedEntities = this.entityExtractionService.extractEntities(
      dto.message,
      entities,
    );

    const params: Record<string, any> = {
      companyId: dto.companyId,
      userId: dto.userId,
    };

    if (enrichedEntities.itemId) params.itemId = enrichedEntities.itemId;
    if (enrichedEntities.itemCode) params.itemCode = enrichedEntities.itemCode;
    if (enrichedEntities.warehouseId) params.warehouseId = enrichedEntities.warehouseId;
    if (enrichedEntities.warehouseName)
      params.warehouseName = enrichedEntities.warehouseName;
    if (enrichedEntities.orderId) params.orderId = enrichedEntities.orderId;
    if (enrichedEntities.orderCode) params.orderCode = enrichedEntities.orderCode;
    if (enrichedEntities.poId) params.poId = enrichedEntities.poId;
    if (enrichedEntities.poCode) params.poCode = enrichedEntities.poCode;
    if (enrichedEntities.soId) params.soId = enrichedEntities.soId;
    if (enrichedEntities.soCode) params.soCode = enrichedEntities.soCode;
    if (enrichedEntities.moId) params.moId = enrichedEntities.moId;
    if (enrichedEntities.moCode) params.moCode = enrichedEntities.moCode;
    if (enrichedEntities.rfqId) params.rfqId = enrichedEntities.rfqId;
    if (enrichedEntities.rfqCode) params.rfqCode = enrichedEntities.rfqCode;
    if (enrichedEntities.quotationId) params.quotationId = enrichedEntities.quotationId;
    if (enrichedEntities.quantity) params.quantity = enrichedEntities.quantity;
    if (enrichedEntities.supplierId) params.supplierId = enrichedEntities.supplierId;
    if (enrichedEntities.customerId) params.customerId = enrichedEntities.customerId;
    if (enrichedEntities.items) params.items = enrichedEntities.items;

    return params;
  }

  private async formatQueryResponse(result: any, intent?: string): Promise<string> {
    if (!result.success || !result.data) {
      return 'Tôi không tìm thấy thông tin bạn cần. Bạn có thể cung cấp thêm chi tiết hoặc thử hỏi theo cách khác được không?';
    }

    let data = result.data;

    if (intent === 'get_order_status' || intent === 'check_inventory') {
      if (data.poCode || data.poId) {
        data = await this.dataEnrichmentService.enrichPurchaseOrder(data);
      } else if (data.soCode || data.soId) {
        data = await this.dataEnrichmentService.enrichSalesOrder(data);
      } else if (data.quantity !== undefined) {
        data = await this.dataEnrichmentService.enrichInventory(data);
      }
    }

    const mappedData = this.dataMappingService.mapDataByIntent(data, intent);

    if (mappedData) {
      return mappedData;
    }

    const systemPrompt = this.promptService.getSystemPrompt({});
    const dataContext = this.promptService.buildDataContextPrompt(data, intent || 'data');

    return await this.localAIService.generateDataDrivenResponse(
      'Phân tích và trình bày dữ liệu này một cách dễ hiểu',
      [],
      data,
      `${systemPrompt}\n\n${dataContext}`,
    );
  }

  async getHistory(sessionId: string, limit?: number): Promise<ConversationMessage[]> {
    return await this.conversationService.getHistory(sessionId, limit);
  }

  async clearHistory(sessionId: string): Promise<void> {
    return await this.conversationService.clearHistory(sessionId);
  }
}
