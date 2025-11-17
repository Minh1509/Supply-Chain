import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';
import { ConversationContextService } from './conversation-context.service';
import { ConversationService } from './conversation.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConversationEntity, MessageEntity])],
  providers: [ConversationService, ConversationContextService],
  exports: [ConversationService, ConversationContextService],
})
export class ConversationModule {}
