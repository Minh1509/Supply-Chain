import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { ConversationMessage, IntentResult } from 'src/common/interfaces/chat.interface';
import { PromptService } from './prompt.service';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly model: ChatOpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly promptService: PromptService,
  ) {
    const openaiConfig = this.configService.get('openai');
    this.model = new ChatOpenAI({
      openAIApiKey: openaiConfig.apiKey,
      modelName: openaiConfig.model,
      temperature: openaiConfig.temperature,
      maxTokens: openaiConfig.maxTokens,
    });
  }

  async generateResponse(
    messages: ConversationMessage[],
    systemPrompt?: string,
    additionalContext?: any,
  ): Promise<string> {
    const langchainMessages = this.buildMessages(
      messages,
      systemPrompt,
      additionalContext,
    );
    const response = await this.model.invoke(langchainMessages);
    return response.content.toString();
  }

  async analyzeIntent(
    message: string,
    conversationHistory: ConversationMessage[] = [],
  ): Promise<IntentResult> {
    try {
      const prompt = this.promptService.getIntentRecognitionPrompt(
        message,
        conversationHistory,
      );
      const response = await this.model.invoke([new HumanMessage(prompt)]);

      const content = response.content.toString();
      const cleanedContent = this.extractJSON(content);

      if (!cleanedContent) {
        return this.getDefaultIntentResult();
      }

      const result = JSON.parse(cleanedContent);

      if (result.confidence < 0.7) {
        return {
          intent: 'general.chat',
          confidence: result.confidence || 0,
          entities: result.entities || {},
        };
      }

      return {
        intent: result.intent || 'general.chat',
        confidence: result.confidence || 0,
        entities: result.entities || {},
      };
    } catch (error) {
      this.logger.error(`Error analyzing intent: ${error.message}`);
      return this.getDefaultIntentResult();
    }
  }

  async generateDataDrivenResponse(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    systemData: any,
    systemPrompt?: string,
  ): Promise<string> {
    const dataContext = this.promptService.buildDataContextPrompt(
      systemData,
      this.getDataType(systemData),
    );

    const conversationPrompt = this.promptService.buildConversationPrompt(
      userMessage,
      conversationHistory,
      systemData,
    );

    const messages: ConversationMessage[] = [
      ...conversationHistory.slice(-5),
      {
        role: 'user',
        content: `${conversationPrompt}\n\n${dataContext}`,
        timestamp: new Date(),
      },
    ];

    return await this.generateResponse(messages, systemPrompt);
  }

  private buildMessages(
    messages: ConversationMessage[],
    systemPrompt?: string,
    additionalContext?: any,
  ): any[] {
    const langchainMessages: any[] = [];

    if (systemPrompt) {
      langchainMessages.push(new SystemMessage(systemPrompt));
    }

    if (additionalContext) {
      const contextStr = JSON.stringify(additionalContext, null, 2);
      langchainMessages.push(
        new SystemMessage(`Dữ liệu bổ sung từ hệ thống:\n${contextStr}`),
      );
    }

    for (const msg of messages) {
      if (msg.role === 'user') {
        langchainMessages.push(new HumanMessage(msg.content));
      } else if (msg.role === 'assistant') {
        langchainMessages.push(new AIMessage(msg.content));
      } else if (msg.role === 'system') {
        langchainMessages.push(new SystemMessage(msg.content));
      }
    }

    return langchainMessages;
  }

  private extractJSON(text: string): string | null {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    return null;
  }

  private getDefaultIntentResult(): IntentResult {
    return {
      intent: 'general.chat',
      confidence: 0,
      entities: {},
    };
  }

  private getDataType(data: any): string {
    if (Array.isArray(data)) {
      if (data.length === 0) return 'empty_array';
      const firstItem = data[0];
      if (firstItem.poCode || firstItem.poId) return 'purchase_orders';
      if (firstItem.soCode || firstItem.soId) return 'sales_orders';
      if (firstItem.warehouseId || firstItem.warehouseName) return 'inventories';
      if (firstItem.itemId || firstItem.itemCode) return 'items';
      if (firstItem.warehouseCode) return 'warehouses';
      return 'array';
    }

    if (data.poCode || data.poId) return 'purchase_order';
    if (data.soCode || data.soId) return 'sales_order';
    if (data.itemId || data.itemCode) return 'item';
    if (data.warehouseId || data.warehouseCode) return 'warehouse';
    if (data.quantity !== undefined && data.onDemandQuantity !== undefined)
      return 'inventory';

    return 'object';
  }
}
