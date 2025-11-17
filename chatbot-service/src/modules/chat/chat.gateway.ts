import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from 'src/common/dto/chat.dto';
import { CHAT_CONSTANTS } from 'src/common/constants';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
  pingTimeout: 120000,
  pingInterval: 25000,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client kết nối: ${client.id}`);
    client.emit(CHAT_CONSTANTS.EVENTS.CONNECTED, {
      message: 'Xin chào! Tôi là trợ lý AI chuỗi cung ứng. Tôi có thể giúp gì cho bạn?',
      clientId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ngắt kết nối: ${client.id}`);
  }

  @SubscribeMessage(CHAT_CONSTANTS.EVENTS.MESSAGE)
  async handleMessage(
    @MessageBody() data: ChatMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.debug(`Nhận tin nhắn từ ${client.id}: ${data.message}`);

      client.emit(CHAT_CONSTANTS.EVENTS.TYPING, { isTyping: true });

      const response = await this.chatService.processMessage(data);

      client.emit(CHAT_CONSTANTS.EVENTS.TYPING, { isTyping: false });
      client.emit(CHAT_CONSTANTS.EVENTS.MESSAGE, response);

      return response;
    } catch (error) {
      this.logger.error(`Lỗi: ${error.message}`);
      client.emit(CHAT_CONSTANTS.EVENTS.TYPING, { isTyping: false });
      client.emit(CHAT_CONSTANTS.EVENTS.ERROR, {
        message: 'Lỗi xử lý tin nhắn. Vui lòng thử lại!',
      });
    }
  }

  @SubscribeMessage(CHAT_CONSTANTS.EVENTS.GET_HISTORY)
  async handleGetHistory(
    @MessageBody() data: { sessionId: string; limit?: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const history = await this.chatService.getHistory(data.sessionId, data.limit);
      return { success: true, data: history };
    } catch (error) {
      this.logger.error(`Lỗi lấy lịch sử: ${error.message}`);
      client.emit(CHAT_CONSTANTS.EVENTS.ERROR, {
        message: 'Không thể lấy lịch sử trò chuyện',
        error: error.message,
      });
    }
  }

  @SubscribeMessage(CHAT_CONSTANTS.EVENTS.CLEAR_HISTORY)
  async handleClearHistory(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.clearHistory(data.sessionId);
      return { success: true, message: 'Đã xóa lịch sử trò chuyện' };
    } catch (error) {
      this.logger.error(`Lỗi xóa lịch sử: ${error.message}`);
      client.emit(CHAT_CONSTANTS.EVENTS.ERROR, {
        message: 'Không thể xóa lịch sử trò chuyện',
        error: error.message,
      });
    }
  }

  // Broadcast message to all clients
  broadcastMessage(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Send message to specific client
  sendToClient(clientId: string, event: string, data: any) {
    this.server.to(clientId).emit(event, data);
  }
}
