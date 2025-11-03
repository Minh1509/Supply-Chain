import { Module } from '@nestjs/common';
import { ActionExecutorService } from './action-executor.service';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [ConversationModule],
  providers: [ActionExecutorService],
  exports: [ActionExecutorService],
})
export class ActionModule {}
