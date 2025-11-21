import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Logger } from '../../common/utils/logger.util';

interface CacheEntry {
  response: string;
  timestamp: number;
}

@Injectable()
export class LlmService {
  private readonly ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private readonly model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 3600000; // 1 hour

  async generate(prompt: string): Promise<string> {
    // Check cache first
    const cacheKey = this.hashPrompt(prompt);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      Logger.log('✅ Cache hit', 'LLM');
      return cached.response;
    }

    try {
      const startTime = Date.now();
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 256,
          },
        },
        { timeout: 60000 },
      );

      const responseTime = Date.now() - startTime;
      Logger.log(`LLM response time: ${responseTime}ms`, 'LLM');

      const result = response.data.response;

      // Cache the response
      this.cache.set(cacheKey, { response: result, timestamp: Date.now() });

      // Clean old cache entries (keep last 100)
      if (this.cache.size > 100) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      return result;
    } catch (error) {
      Logger.error('LLM generation error', error.message, 'LLM');
      return this.fallbackResponse(prompt);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, { timeout: 2000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  private hashPrompt(prompt: string): string {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private fallbackResponse(prompt: string): string {
    if (prompt.includes('tồn kho') || prompt.includes('inventory')) {
      return 'Xin lỗi, tôi không thể kiểm tra tồn kho lúc này. Vui lòng thử lại với format: "Tồn kho sản phẩm [tên] ở kho [tên kho]"';
    }
    if (prompt.includes('đơn hàng') || prompt.includes('order')) {
      return 'Không thể tra cứu đơn hàng. Vui lòng thử lại với format: "Trạng thái đơn hàng SO-123" hoặc "Đơn hàng PO-456"';
    }
    if (prompt.includes('báo cáo') || prompt.includes('report')) {
      return 'Không thể tạo báo cáo lúc này. Vui lòng thử: "Báo cáo tồn kho tháng 11" hoặc "Báo cáo bán hàng quý 4"';
    }
    if (prompt.includes('sản xuất') || prompt.includes('manufacture')) {
      return 'Không thể tra cứu thông tin sản xuất. Vui lòng thử: "Lệnh sản xuất MO-123" hoặc "Tiến độ sản xuất"';
    }
    if (prompt.includes('phiếu') || prompt.includes('ticket')) {
      return 'Không thể tạo phiếu. Vui lòng thử: "Tạo phiếu xuất kho 50 sản phẩm ABC" hoặc "Tạo phiếu nhập kho"';
    }
    return 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc hỏi theo các mẫu câu trong hướng dẫn.';
  }
}
