import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LlmService {
  private readonly ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private readonly model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

  async generate(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        },
        { timeout: 30000 },
      );

      return response.data.response;
    } catch (error) {
      console.error('LLM generation error:', error.message);
      return this.fallbackResponse(prompt);
    }
  }

  private fallbackResponse(prompt: string): string {
    if (prompt.includes('tồn kho')) {
      return 'Tôi đang kiểm tra thông tin tồn kho cho bạn. Vui lòng đợi trong giây lát.';
    }
    if (prompt.includes('đơn hàng')) {
      return 'Tôi đang tra cứu thông tin đơn hàng. Vui lòng chờ một chút.';
    }
    return 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.';
  }
}
