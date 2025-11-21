import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { RagModule } from '../rag/rag.module';
import { IntentModule } from '../intent/intent.module';
import { ActionsModule } from '../actions/actions.module';
import { ConversationModule } from '../conversation/conversation.module';
import { PersonalizationModule } from '../personalization/personalization.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ChatService } from './chat.service';

@Module({
  imports: [
    RagModule,
    IntentModule,
    ActionsModule,
    ConversationModule,
    PersonalizationModule,
    AnalyticsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
