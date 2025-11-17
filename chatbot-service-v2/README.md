# Chatbot Service V2

RAG-based chatbot service cho Supply Chain Management System, được xây dựng bằng NestJS và Ollama.

## 🚀 Features

- **RAG (Retrieval-Augmented Generation)**: Tích hợp knowledge base để trả lời chính xác
- **Intent Recognition**: Nhận diện ý định người dùng
- **Context Management**: Quản lý ngữ cảnh hội thoại
- **Personalization**: Cá nhân hóa trải nghiệm người dùng
- **Analytics**: Theo dõi và phân tích hiệu suất chatbot
- **RabbitMQ Integration**: Giao tiếp với các microservices khác
- **Swagger Documentation**: API docs tự động

## 📋 Prerequisites

- Node.js 22+
- PostgreSQL 15+
- RabbitMQ 3.13+
- Ollama (với models: qwen2.5:3b, nomic-embed-text)
- Docker & Docker Compose (cho deployment)

## 🛠️ Installation

### Local Development

```bash
# Install dependencies
yarn install

# Setup environment
cp .env.example .env

# Run database migration
yarn migrate:run

# Start development server
yarn start:dev
```

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f chatbot-service-v2

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build chatbot-service-v2

# Start production services
docker-compose -f docker-compose.prod.yml up -d chatbot-service-v2 ollama

# Verify deployment
bash scripts/verify-deployment.sh
```

## 📁 Project Structure

```
chatbot-service-v2/
├── src/
│   ├── common/           # Shared utilities, filters, guards
│   ├── config/           # Configuration files
│   ├── database/         # Database migrations
│   └── modules/
│       ├── actions/      # Action handlers (inventory, order, etc.)
│       ├── analytics/    # Analytics & metrics
│       ├── chat/         # Chat endpoints
│       ├── conversation/ # Conversation management
│       ├── health/       # Health check
│       ├── intent/       # Intent recognition
│       ├── personalization/ # User preferences
│       ├── rabbitmq/     # Message queue integration
│       └── rag/          # RAG implementation
├── knowledge-base/       # Knowledge base files
├── public/              # Static web UI
├── scripts/             # Utility scripts
├── Dockerfile           # Development Dockerfile
├── Dockerfile.prod      # Production Dockerfile
└── docker-compose.yml   # Development compose file
```

## 🔧 Configuration

### Environment Variables

| Variable               | Description             | Default                           |
| ---------------------- | ----------------------- | --------------------------------- |
| APP_PORT               | Application port        | 3006                              |
| NODE_ENV               | Environment             | development                       |
| DB_HOST                | PostgreSQL host         | localhost                         |
| DB_PORT                | PostgreSQL port         | 5432                              |
| DB_DATABASE            | Database name           | chatbot_service                   |
| RABBITMQ_URL           | RabbitMQ connection URL | amqp://admin:admin@localhost:5672 |
| OLLAMA_BASE_URL        | Ollama API URL          | http://localhost:11434            |
| OLLAMA_MODEL           | LLM model               | qwen2.5:3b                        |
| OLLAMA_EMBEDDING_MODEL | Embedding model         | nomic-embed-text                  |

## 📚 API Documentation

Sau khi start service, truy cập:

- **Swagger UI**: http://localhost:3006/api/docs
- **Health Check**: http://localhost:3006/api/health
- **Web UI**: http://localhost:3006

## 🧪 Testing

```bash
# Run integration tests
bash test/integration.test.sh

# Test chat functionality
bash scripts/test-chat.sh
```

## 🗄️ Database

### Migrations

```bash
# Generate new migration
yarn migration:generate src/database/migrations/MigrationName

# Run migrations
yarn migrate:run

# Revert last migration
yarn migration:revert
```

### Schema

- **conversations**: Lưu trữ hội thoại
- **messages**: Lưu trữ tin nhắn
- **user_preferences**: Cài đặt người dùng
- **chat_logs**: Logs cho analytics
- **metrics**: Metrics và thống kê

## 🤖 Ollama Setup

```bash
# Pull required models
ollama pull qwen2.5:3b
ollama pull nomic-embed-text

# List installed models
ollama list

# Test model
ollama run qwen2.5:3b "Hello"
```

## 📊 Monitoring

### Logs

```bash
# Development
yarn start:dev

# Production
docker logs -f chatbot-service-v2-prod
```

### Metrics

Truy cập analytics endpoints:

- GET /api/analytics/metrics
- GET /api/analytics/conversations
- GET /api/analytics/intents

## 🔒 Security

- Sử dụng environment variables cho sensitive data
- Enable CORS với whitelist domains
- Validate input với class-validator
- Sanitize user input
- Rate limiting (recommended)

## 🚨 Troubleshooting

### Service không start

1. Kiểm tra logs: `docker logs chatbot-service-v2-prod`
2. Verify database connection
3. Check RabbitMQ connection
4. Ensure Ollama is running

### Migration fails

```bash
# Check database exists
docker exec postgres-prod psql -U postgres -l | grep chatbot_service

# Run migration manually
docker exec chatbot-service-v2-prod yarn migrate:prod:run
```

### Ollama không response

```bash
# Check Ollama status
docker exec ollama-prod ollama list

# Pull models if missing
docker exec ollama-prod ollama pull qwen2.5:3b
docker exec ollama-prod ollama pull nomic-embed-text
```

## 📝 Scripts

- `yarn start:dev` - Start development server
- `yarn start:prod` - Start production server
- `yarn build` - Build for production
- `yarn migrate:run` - Run database migrations
- `yarn lint` - Lint code

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

## 📄 License

Private - Supply Chain Management System

## 📞 Support

For issues and questions, contact the development team.
