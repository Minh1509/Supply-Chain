# Installation Guide

## 📦 Prerequisites

- Node.js >= 20
- PostgreSQL >= 15
- RabbitMQ >= 3.13
- Ollama (for local LLM)
- Docker & Docker Compose (optional)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd chatbot-service-v2
npm install
```

**Important:** Make sure all dependencies are installed, especially:

- `@nestjs/typeorm`
- `typeorm`
- `typeorm-naming-strategies`
- `pg`

### 2. Setup Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull qwen2.5:1.5b
ollama pull nomic-embed-text

# Verify
ollama list
```

### 3. Setup Database

**Option A: Use existing PostgreSQL from docker-compose**

```bash
# Database already created in init.sql
# Just make sure postgres is running
docker ps | grep postgres
```

**Option B: Create database manually**

```sql
CREATE DATABASE chatbot_service;
GRANT ALL PRIVILEGES ON DATABASE chatbot_service TO postgres;
```

### 4. Configure Environment

Copy and edit `.env`:

```bash
cp .env .env.local
# Edit .env.local if needed
```

Verify configuration:

```env
# App
APP_NAME=Chatbot Service
APP_PORT=3006
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5466
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=chatbot_service

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5666

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:3b
```

### 5. Run Migrations (Optional)

TypeORM will auto-create tables in development mode (`synchronize: true`).

For production, run migrations:

```bash
npm run migration:run
```

### 6. Start Service

**Development:**

```bash
npm run start:dev
```

**Production:**

```bash
npm run build
npm run start:prod
```

### 7. Verify Installation

**Check service:**

```bash
curl http://localhost:3006/api/docs
```

**Test chat:**

```bash
curl -X POST http://localhost:3006/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Xin chào",
    "userId": "user123",
    "userRole": "warehouse_staff"
  }'
```

**Check analytics:**

```bash
curl http://localhost:3006/api/analytics/popular-intents?days=7
```

## 🐳 Docker Installation

### Using Docker Compose

```bash
# From project root
docker-compose up -d chatbot-service-v2 ollama postgres rabbitmq
```

### Check logs

```bash
docker logs chatbot-service-v2 -f
```

### Access service

```bash
curl http://localhost:3006/api/docs
```

## 🔧 Troubleshooting

### Issue 1: TypeORM not found

**Solution:**

```bash
npm install @nestjs/typeorm typeorm typeorm-naming-strategies pg --save
```

### Issue 2: Ollama not responding

**Solution:**

```bash
# Check Ollama
curl http://localhost:11434/api/tags

# Restart Ollama
systemctl restart ollama

# Or with Docker
docker restart ollama
```

### Issue 3: Database connection failed

**Solution:**

```bash
# Check PostgreSQL
docker ps | grep postgres

# Check database exists
docker exec -it postgres psql -U postgres -c "\l"

# Create database if missing
docker exec -it postgres psql -U postgres -c "CREATE DATABASE chatbot_service;"
```

### Issue 4: RabbitMQ connection failed

**Solution:**

```bash
# Check RabbitMQ
docker ps | grep rabbitmq

# Restart RabbitMQ
docker restart rabbitmq

# Check queues
docker exec rabbitmq rabbitmqctl list_queues
```

### Issue 5: Port already in use

**Solution:**

```bash
# Change port in .env
APP_PORT=3007

# Or kill process using port 3006
lsof -ti:3006 | xargs kill -9
```

## 📊 Database Schema

Tables will be auto-created on first run:

1. **conversations** - Store conversations
2. **messages** - Store all messages
3. **user_preferences** - User settings
4. **chat_logs** - Analytics logs
5. **metrics** - Performance metrics

## 🧪 Testing

### Run integration tests

```bash
chmod +x test/integration.test.sh
./test/integration.test.sh
```

### Manual testing

```bash
# Test inventory query
curl -X POST http://localhost:3006/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tồn kho sản phẩm ABC?"}'

# Test with conversation
curl -X POST http://localhost:3006/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Xuất 50 cái",
    "conversationId": "uuid-from-previous-response"
  }'
```

## 📚 Next Steps

1. Read [QUICKSTART.md](./QUICKSTART.md) for quick usage
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
3. Read [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for integration
4. Check [Swagger API Docs](http://localhost:3006/api/docs)

## ✅ Installation Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (`npm install`)
- [ ] Ollama installed and models pulled
- [ ] PostgreSQL running
- [ ] RabbitMQ running
- [ ] Database created
- [ ] Environment configured
- [ ] Service started
- [ ] API accessible
- [ ] Chat working
- [ ] Analytics working

## 🆘 Support

If you encounter issues:

1. Check logs: `docker logs chatbot-service-v2`
2. Check dependencies: `npm list`
3. Check services: `docker ps`
4. Read [FIXES_AND_IMPROVEMENTS.md](./FIXES_AND_IMPROVEMENTS.md)
5. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**Status:** ✅ Ready for Installation  
**Version:** 3.0  
**Last Updated:** 2024
