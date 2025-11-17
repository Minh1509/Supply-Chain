import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { KnowledgeLoaderService } from './knowledge-loader.service';
import { RagService } from './rag.service';
import { VectorStoreService } from './vector-store.service';
import { LlmService } from './llm.service';

@Module({
  providers: [RagService, EmbeddingService, VectorStoreService, LlmService, KnowledgeLoaderService],
  exports: [RagService],
})
export class RagModule {}
