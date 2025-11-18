import { Injectable } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { VectorStoreService } from './vector-store.service';
import { LlmService } from './llm.service';
import { FaqMatcherService } from './faq-matcher.service';
import { Logger } from '../../common/utils/logger.util';

@Injectable()
export class RagService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
    private readonly llmService: LlmService,
    private readonly faqMatcher: FaqMatcherService,
  ) {}

  async retrieve(query: string, intent: string): Promise<string> {
    // STRATEGY 1: Try FAQ exact/fuzzy match first (fastest, most accurate)
    const faqMatch = await this.faqMatcher.match(query, 0.7);
    if (faqMatch && faqMatch.score >= 0.85) {
      Logger.log(
        `✅ FAQ Match (${faqMatch.matchType}, score: ${faqMatch.score.toFixed(2)})`,
        'RAG',
      );
      return `FAQ Match:\nQ: ${faqMatch.faq.question}\nA: ${faqMatch.faq.answer}`;
    }

    // STRATEGY 2: Get top FAQs as context
    const topFaqs = await this.faqMatcher.matchMultiple(query, 2);
    let context = '';

    if (topFaqs.length > 0) {
      context += 'Câu hỏi tương tự:\n';
      topFaqs.forEach((match, idx) => {
        context += `${idx + 1}. Q: ${match.faq.question}\n   A: ${match.faq.answer}\n\n`;
      });
    }

    // STRATEGY 3: Add vector search results
    const embedding = await this.embeddingService.embed(query);
    const docs = await this.vectorStore.search(query, embedding, 2);

    if (docs.length > 0) {
      context += '\nThông tin từ hướng dẫn:\n';
      context += docs.map((doc) => doc.content).join('\n\n');
    }

    return context || 'Không tìm thấy thông tin liên quan.';
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

    // Check if realtime data has error/fallback
    const hasFallback = realtimeData?.fallback || realtimeData?.error;

    const prompt = this.buildPrompt(
      query,
      context,
      realtimeData,
      intent,
      history,
      personalizedPrompt,
      hasFallback,
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
    hasFallback = false,
  ): string {
    let prompt = `Bạn là trợ lý AI của hệ thống quản lý chuỗi cung ứng (SCMS).
Nhiệm vụ: Hỗ trợ nhân viên tra cứu thông tin và thực hiện các thao tác.

Quy tắc:
- Trả lời bằng tiếng Việt
- Ngắn gọn, chính xác, dễ hiểu
- Nếu không chắc chắn, hỏi lại
- Đề xuất hành động tiếp theo nếu phù hợp
${hasFallback ? '- LƯU Ý: Dữ liệu realtime không khả dụng, chỉ dùng thông tin từ hướng dẫn' : ''}

`;

    if (personalizedPrompt) {
      prompt += `Thông tin người dùng:\n${personalizedPrompt}\n`;
    }

    if (context) {
      prompt += `Thông tin hướng dẫn:\n${context}\n\n`;
    }

    if (realtimeData && !hasFallback) {
      prompt += `Dữ liệu thời gian thực:\n${JSON.stringify(realtimeData, null, 2)}\n\n`;
    } else if (hasFallback) {
      prompt += `LƯU Ý: Không thể lấy dữ liệu realtime. Hãy hướng dẫn user cách tra cứu thủ công hoặc thử lại sau.\n\n`;
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
