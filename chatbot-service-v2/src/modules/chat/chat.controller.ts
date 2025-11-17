import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatRequestDto, ChatResponseDto } from '../../common/dto/chat.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Send message to chatbot' })
  async chat(@Body() dto: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chatService.processMessage(dto);
  }
}
