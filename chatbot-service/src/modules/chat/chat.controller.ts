import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto, ConversationHistoryDto } from 'src/common/dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'chatbot-service',
      timestamp: new Date(),
    };
  }

  @Post('message')
  async sendMessage(@Body() dto: ChatMessageDto) {
    return await this.chatService.processMessage(dto);
  }

  @Get('history/:sessionId')
  async getHistory(
    @Param('sessionId') sessionId: string,
    @Query('limit') limit?: number,
  ) {
    return await this.chatService.getHistory(sessionId, limit);
  }

  @Post('history/:sessionId/clear')
  async clearHistory(@Param('sessionId') sessionId: string) {
    await this.chatService.clearHistory(sessionId);
    return {
      success: true,
      message: 'History cleared',
    };
  }
}
