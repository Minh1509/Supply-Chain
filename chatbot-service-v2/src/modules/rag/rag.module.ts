import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { KnowledgeLoaderService } from './knowledge-loader.service';
import { RagService } from './rag.service';
import { VectorStoreService } from './vector-store.service';
import { LlmService } from './llm.service';
import { FaqMatcherService } from './faq-matcher.service';
import { RagController } from './rag.controller';

@Module({
  controllers: [RagController],
  providers: [
    RagService,
    EmbeddingService,
    VectorStoreService,
    LlmService,
    KnowledgeLoaderService,
    FaqMatcherService,
  ],
  exports: [RagService, FaqMatcherService],
})
export class RagModule {}
