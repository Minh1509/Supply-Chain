import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { ConversationMessage } from 'src/common/interfaces/chat.interface';

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
    return response.content.toString();
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

  async analyzeIntent(message: string): Promise<any> {
    const prompt = `Analyze this message and return JSON with intent and entities:
Message: "${message}"

Return format:
{
  "intent": "intent_name",
  "confidence": 0.0-1.0,
  "entities": {
    "entity_name": "value"
  }
}`;

    const response = await this.model.invoke([new HumanMessage(prompt)]);
    try {
      return JSON.parse(response.content.toString());
    } catch (e) {
      return {
        intent: 'unknown',
        confidence: 0,
        entities: {},
      };
    }
  }
}
