# Chatbot Service

AI-powered chatbot service for Supply Chain Management System.

## Features

- 🤖 OpenAI GPT-4 integration
- 💬 Real-time WebSocket communication
- 🔄 Multi-turn conversation with context
- 🎯 Intent recognition and entity extraction
- ⚡ Action execution (call existing microservices)
- 📊 Query information (inventory, orders, reports)
- 🔐 User authentication and authorization
- 📝 Conversation history with Redis

## Tech Stack

- **Framework:** NestJS
- **AI:** OpenAI GPT-4, LangChain
- **WebSocket:** Socket.IO
- **Message Queue:** RabbitMQ
- **Cache:** Redis
- **Language:** TypeScript

## Installation

```bash
npm install
```

## Running the service

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `OPENAI_API_KEY`: Your OpenAI API key
- `RABBITMQ_URL`: RabbitMQ connection URL
- `REDIS_HOST`: Redis host
- Other service queues

## API Documentation

### WebSocket Events

#### Client → Server

- `message`: Send a message to chatbot
- `get_history`: Get conversation history
- `clear_history`: Clear conversation history

#### Server → Client

- `message`: Receive bot response
- `typing`: Bot is typing
- `error`: Error occurred

### REST Endpoints

- `GET /api/v1/chat/health`: Health check
- `GET /api/v1/chat/history/:sessionId`: Get chat history

## Architecture

```
chatbot-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/              # Configuration files
│   ├── common/              # Shared utilities
│   ├── modules/
│   │   ├── chat/            # Chat controller & gateway
│   │   ├── llm/             # LLM integration (OpenAI)
│   │   ├── intent/          # Intent recognition
│   │   ├── action/          # Action executor
│   │   └── conversation/    # Conversation manager
```

## Usage Examples

### Check Inventory

```
User: "Tồn kho item 123 ở kho Hà Nội còn bao nhiêu?"
Bot: "Item #123 tại kho Hà Nội hiện có 500 units"
```

### Create Purchase Order

```
User: "Tạo đơn mua hàng cho 100 units item X từ supplier A"
Bot: "Đã tạo Purchase Order #PO-2024-001 thành công"
```

### Get Order Status

```
User: "Đơn hàng PO-2024-001 đang ở trạng thái gì?"
Bot: "PO-2024-001 đang ở trạng thái APPROVED"
```
