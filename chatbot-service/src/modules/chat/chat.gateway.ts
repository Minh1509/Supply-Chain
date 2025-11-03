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
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit(CHAT_CONSTANTS.EVENTS.CONNECTED, {
      message: 'Connected to chatbot service',
      clientId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(CHAT_CONSTANTS.EVENTS.MESSAGE)
  async handleMessage(
    @MessageBody() data: ChatMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.debug(`Received message from ${client.id}: ${data.message}`);

      // Send typing indicator
      client.emit(CHAT_CONSTANTS.EVENTS.TYPING, { isTyping: true });

      // Process message
      const response = await this.chatService.processMessage(data);

      // Send response
      client.emit(CHAT_CONSTANTS.EVENTS.TYPING, { isTyping: false });
      client.emit(CHAT_CONSTANTS.EVENTS.MESSAGE, response);

      return response;
    } catch (error) {
      this.logger.error(`Error handling message: ${error.message}`, error.stack);
      client.emit(CHAT_CONSTANTS.EVENTS.ERROR, {
        message: 'Failed to process message',
        error: error.message,
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
      this.logger.error(`Error getting history: ${error.message}`);
      client.emit(CHAT_CONSTANTS.EVENTS.ERROR, {
        message: 'Failed to get history',
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
      return { success: true, message: 'History cleared' };
    } catch (error) {
      this.logger.error(`Error clearing history: ${error.message}`);
      client.emit(CHAT_CONSTANTS.EVENTS.ERROR, {
        message: 'Failed to clear history',
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
