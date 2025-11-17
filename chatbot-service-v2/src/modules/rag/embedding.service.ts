import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmbeddingService {
  private readonly ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  async embed(text: string): Promise<number[]> {
    try {
      const model = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
      const response = await axios.post(`${this.ollamaUrl}/api/embeddings`, {
        model,
        prompt: text,
      });
      return response.data.embedding;
    } catch (error) {
      console.error('Embedding error:', error.message);
      return this.fallbackEmbedding(text);
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embed(text)));
  }

  private fallbackEmbedding(text: string): number[] {
    const hash = this.simpleHash(text);
    return Array.from({ length: 384 }, (_, i) => Math.sin(hash + i) * 0.5);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash;
  }
}
