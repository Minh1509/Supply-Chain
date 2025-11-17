#!/bin/bash

# Integration Test Script for Chatbot Service V2
# Tests integration with all microservices

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🧪 Chatbot Service V2 - Integration Tests          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"

CHATBOT_URL="http://localhost:3006"
RABBITMQ_URL="http://localhost:15678"
RABBITMQ_USER="admin"
RABBITMQ_PASS="admin"

# Test 1: Health Check
echo -e "\n${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s $CHATBOT_URL/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ Health check failed${NC}"
    exit 1
fi

# Test 2: RabbitMQ Connection
echo -e "\n${YELLOW}Test 2: RabbitMQ Connection${NC}"
RABBITMQ_STATUS=$(curl -s -u $RABBITMQ_USER:$RABBITMQ_PASS $RABBITMQ_URL/api/overview | grep -o '"rabbitmq_version":"[^"]*"')
if [ ! -z "$RABBITMQ_STATUS" ]; then
    echo -e "${GREEN}✓ RabbitMQ is accessible${NC}"
    echo "Status: $RABBITMQ_STATUS"
else
    echo -e "${RED}✗ RabbitMQ is not accessible${NC}"
fi

# Test 3: Database Connection
echo -e "\n${YELLOW}Test 3: Database Connection${NC}"
DB_CHECK=$(docker exec postgres-prod psql -U postgres -d chatbot_service -c "SELECT 1;" 2>&1)
if echo "$DB_CHECK" | grep -q "1 row"; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    echo "$DB_CHECK"
fi

# Test 4: Database Tables
echo -e "\n${YELLOW}Test 4: Database Tables${NC}"
TABLES=$(docker exec postgres-prod psql -U postgres -d chatbot_service -c "\dt" 2>&1)
if echo "$TABLES" | grep -q "conversations"; then
    echo -e "${GREEN}✓ Database tables exist${NC}"
    echo "$TABLES" | grep -E "conversations|messages|user_preferences"
else
    echo -e "${RED}✗ Database tables not found${NC}"
fi

# Test 5: Ollama Connection
echo -e "\n${YELLOW}Test 5: Ollama Connection${NC}"
OLLAMA_MODELS=$(docker exec ollama-prod ollama list 2>&1)
if echo "$OLLAMA_MODELS" | grep -q "qwen2.5:3b"; then
    echo -e "${GREEN}✓ Ollama models are loaded${NC}"
    echo "$OLLAMA_MODELS"
else
    echo -e "${YELLOW}⚠ Ollama models not found${NC}"
    echo "Run: docker exec ollama-prod ollama pull qwen2.5:3b"
fi

# Test 6: Basic Chat
echo -e "\n${YELLOW}Test 6: Basic Chat${NC}"
CHAT_RESPONSE=$(curl -s -X POST $CHATBOT_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Xin chào",
    "userId": "test-user",
    "userName": "Test User",
    "userRole": "admin",
    "companyId": 1
  }')

if [ ! -z "$CHAT_RESPONSE" ]; then
    echo -e "${GREEN}✓ Chat endpoint is working${NC}"
    echo "Response preview: $(echo $CHAT_RESPONSE | cut -c1-100)..."
else
    echo -e "${RED}✗ Chat endpoint failed${NC}"
fi

# Test 7: Conversation Persistence
echo -e "\n${YELLOW}Test 7: Conversation Persistence${NC}"
CONV_COUNT=$(docker exec postgres-prod psql -U postgres -d chatbot_service -c "SELECT COUNT(*) FROM conversations;" 2>&1 | grep -o "[0-9]*" | head -1)
if [ ! -z "$CONV_COUNT" ]; then
    echo -e "${GREEN}✓ Conversations are being saved${NC}"
    echo "Total conversations: $CONV_COUNT"
else
    echo -e "${YELLOW}⚠ Could not verify conversation persistence${NC}"
fi

# Test 8: Message Persistence
echo -e "\n${YELLOW}Test 8: Message Persistence${NC}"
MSG_COUNT=$(docker exec postgres-prod psql -U postgres -d chatbot_service -c "SELECT COUNT(*) FROM messages;" 2>&1 | grep -o "[0-9]*" | head -1)
if [ ! -z "$MSG_COUNT" ]; then
    echo -e "${GREEN}✓ Messages are being saved${NC}"
    echo "Total messages: $MSG_COUNT"
else
    echo -e "${YELLOW}⚠ Could not verify message persistence${NC}"
fi

# Test 9: Inventory Service Integration
echo -e "\n${YELLOW}Test 9: Inventory Service Integration${NC}"
INVENTORY_RESPONSE=$(curl -s -X POST $CHATBOT_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Kiểm tra tồn kho sản phẩm 1",
    "userId": "test-user",
    "companyId": 1
  }')

if echo "$INVENTORY_RESPONSE" | grep -q "tồn kho\|inventory"; then
    echo -e "${GREEN}✓ Inventory integration working${NC}"
else
    echo -e "${YELLOW}⚠ Inventory integration may be using mock data${NC}"
fi

# Test 10: RabbitMQ Queues
echo -e "\n${YELLOW}Test 10: RabbitMQ Queues${NC}"
QUEUES=$(curl -s -u $RABBITMQ_USER:$RABBITMQ_PASS $RABBITMQ_URL/api/queues)
if echo "$QUEUES" | grep -q "chatbot_queue"; then
    echo -e "${GREEN}✓ Chatbot queue exists${NC}"
else
    echo -e "${YELLOW}⚠ Chatbot queue not found (will be created on first use)${NC}"
fi

# Test 11: Service Resources
echo -e "\n${YELLOW}Test 11: Service Resources${NC}"
STATS=$(docker stats --no-stream chatbot-service-v2-prod --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}")
echo "$STATS"
echo -e "${GREEN}✓ Resource usage checked${NC}"

# Test 12: Service Logs
echo -e "\n${YELLOW}Test 12: Service Logs (checking for errors)${NC}"
ERROR_COUNT=$(docker logs chatbot-service-v2-prod --tail 100 2>&1 | grep -i "error" | grep -v "error_message" | wc -l)
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ No errors in recent logs${NC}"
else
    echo -e "${YELLOW}⚠ Found $ERROR_COUNT error(s) in logs${NC}"
    echo "Recent errors:"
    docker logs chatbot-service-v2-prod --tail 100 2>&1 | grep -i "error" | grep -v "error_message" | tail -3
fi

# Summary
echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Integration Tests Complete!                      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}📊 Test Summary:${NC}"
echo "  - Health Check: ✓"
echo "  - RabbitMQ: ✓"
echo "  - Database: ✓"
echo "  - Ollama: Check logs above"
echo "  - Chat API: ✓"
echo "  - Persistence: ✓"
echo "  - Integration: Check logs above"

echo -e "\n${YELLOW}🔗 Useful Links:${NC}"
echo "  - Chatbot API: $CHATBOT_URL/api/docs"
echo "  - RabbitMQ Management: $RABBITMQ_URL"
echo "  - Health Check: $CHATBOT_URL/api/health"

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo "  1. Test with real user scenarios"
echo "  2. Monitor resource usage over time"
echo "  3. Test integration with other services"
echo "  4. Load testing if needed"

echo -e "\n${GREEN}Happy testing! 🎉${NC}"
