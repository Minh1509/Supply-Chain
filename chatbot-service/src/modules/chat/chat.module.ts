import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ConversationModule } from '../conversation/conversation.module';
import { LLMModule } from '../llm/llm.module';
import { ActionModule } from '../action/action.module';

@Module({
  imports: [ConversationModule, LLMModule, ActionModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
