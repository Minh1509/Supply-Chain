import { Module } from '@nestjs/common';
import { ConversationModule } from '../conversation/conversation.module';
import { DataEnrichmentService } from './data-enrichment.service';

@Module({
  imports: [ConversationModule],
  providers: [DataEnrichmentService],
  exports: [DataEnrichmentService],
})
export class DataEnrichmentModule {}
