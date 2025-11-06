import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { ConversationMessage } from 'src/common/interfaces/chat.interface';
import { PromptService } from './prompt.service';

@Injectable()
export class OpenAIService {
  private model: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {
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
  ): Promise<string> {
    const langchainMessages = this.convertToLangChainMessages(messages, systemPrompt);

    const response = await this.model.invoke(langchainMessages);
    const responseText = response.content.toString();
    
    // Đảm bảo response luôn bằng tiếng Việt
    if (this.containsVietnamese(messages) && !this.isVietnameseResponse(responseText)) {
      return await this.translateToVietnamese(responseText);
    }
    
    return responseText;
  }

  async generateWithFunctions(
    messages: ConversationMessage[],
    functions: any[],
    systemPrompt?: string,
  ): Promise<any> {
    const langchainMessages = this.convertToLangChainMessages(messages, systemPrompt);

    const modelWithFunctions = this.model.bind({
      functions: functions,
    });

    const response = await modelWithFunctions.invoke(langchainMessages);
    return response;
  }

  private convertToLangChainMessages(
    messages: ConversationMessage[],
    systemPrompt?: string,
  ) {
    const langchainMessages: any[] = [];

    if (systemPrompt) {
      langchainMessages.push(new SystemMessage(systemPrompt));
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

  private containsVietnamese(messages: ConversationMessage[]): boolean {
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    return messages.some(msg => vietnamesePattern.test(msg.content));
  }

  private isVietnameseResponse(text: string): boolean {
    const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    return vietnamesePattern.test(text);
  }

  private async translateToVietnamese(text: string): Promise<string> {
    try {
      const translationPrompt = `Dịch đoạn văn sau sang tiếng Việt tự nhiên, giữ nguyên ý nghĩa:
"${text}"`;
      
      const response = await this.model.invoke([new HumanMessage(translationPrompt)]);
      return response.content.toString();
    } catch (error) {
      console.error(`Lỗi dịch sang tiếng Việt: ${error.message}`);
      return text; // Trả về bản gốc nếu lỗi dịch
    }
  }

  async analyzeIntent(message: string, conversationHistory: ConversationMessage[] = []): Promise<any> {
    const promptService = new PromptService();
    const prompt = promptService.getIntentRecognitionPrompt(message, conversationHistory);

    const response = await this.model.invoke([new HumanMessage(prompt)]);
    try {
      const result = JSON.parse(response.content.toString());
      
      // Validate confidence threshold
      if (result.confidence < 0.7) {
        return {
          intent: 'general.chat',
          confidence: result.confidence || 0,
          entities: result.entities || {},
        };
      }
      
      return result;
    } catch (e) {
      return {
        intent: 'general.chat',
        confidence: 0,
        entities: {},
      };
    }
  }
}
