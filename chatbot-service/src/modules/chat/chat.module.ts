import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ConversationModule } from '../conversation/conversation.module';
import { LLMModule } from '../llm/llm.module';
import { ActionModule } from '../action/action.module';
import { DataMappingModule } from '../data-mapping/data-mapping.module';
import { EntityExtractionModule } from '../entity-extraction/entity-extraction.module';
import { DataEnrichmentModule } from '../data-enrichment/data-enrichment.module';

@Module({
  imports: [
    ConversationModule,
    LLMModule,
    ActionModule,
    DataMappingModule,
    EntityExtractionModule,
    DataEnrichmentModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
