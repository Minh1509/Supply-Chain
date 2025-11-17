import { Injectable } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import { LlmService } from './llm.service';

@Injectable()
export class RagService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
    private readonly llmService: LlmService,
  ) {}

  async retrieve(query: string, intent: string): Promise<string> {
    const embedding = await this.embeddingService.embed(query);
    const docs = await this.vectorStore.search(query, embedding, 3);

    if (docs.length === 0) {
      return '';
    }

    return docs.map((doc) => doc.content).join('\n\n');
  }

  async generate(params: {
    query: string;
    context: string;
    realtimeData: any;
    intent: string;
    history: any[];
    personalizedPrompt?: string;
  }): Promise<string> {
    const { query, context, realtimeData, intent, history, personalizedPrompt } = params;

    const prompt = this.buildPrompt(
      query,
      context,
      realtimeData,
      intent,
      history,
      personalizedPrompt,
    );
    return this.llmService.generate(prompt);
  }

  private buildPrompt(
    query: string,
    context: string,
    realtimeData: any,
    intent: string,
    history: any[],
    personalizedPrompt?: string,
  ): string {
    let prompt = `Bạn là trợ lý AI của hệ thống quản lý chuỗi cung ứng (SCMS).
Nhiệm vụ: Hỗ trợ nhân viên tra cứu thông tin và thực hiện các thao tác.

Quy tắc:
- Trả lời bằng tiếng Việt
- Ngắn gọn, chính xác, dễ hiểu
- Nếu không chắc chắn, hỏi lại
- Đề xuất hành động tiếp theo nếu phù hợp

`;

    if (personalizedPrompt) {
      prompt += `Thông tin người dùng:\n${personalizedPrompt}\n`;
    }

    if (context) {
      prompt += `Thông tin hướng dẫn:\n${context}\n\n`;
    }

    if (realtimeData) {
      prompt += `Dữ liệu thời gian thực:\n${JSON.stringify(realtimeData, null, 2)}\n\n`;
    }

    if (history.length > 0) {
      const recentHistory = history.slice(-4).reverse();
      prompt += `Lịch sử hội thoại:\n`;
      recentHistory.forEach((msg) => {
        prompt += `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.content}\n`;
      });
      prompt += '\n';
    }

    prompt += `Câu hỏi hiện tại: ${query}\n\nTrả lời:`;

    return prompt;
  }
}
