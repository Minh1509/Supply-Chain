#!/bin/bash

echo "🔍 Verifying Chatbot Service Deployment..."
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if service is running
echo -e "\n${YELLOW}1. Checking if service is running...${NC}"
if docker ps | grep -q "chatbot-service-v2-prod"; then
    echo -e "${GREEN}✓ Service container is running${NC}"
else
    echo -e "${RED}✗ Service container is not running${NC}"
    exit 1
fi

# Check health endpoint
echo -e "\n${YELLOW}2. Checking health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:3006/api/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Health endpoint is accessible${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ Health endpoint is not accessible${NC}"
fi

# Check Swagger docs
echo -e "\n${YELLOW}3. Checking Swagger documentation...${NC}"
SWAGGER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3006/api/docs)
if [ "$SWAGGER_RESPONSE" = "200" ] || [ "$SWAGGER_RESPONSE" = "301" ]; then
    echo -e "${GREEN}✓ Swagger docs are accessible${NC}"
else
    echo -e "${RED}✗ Swagger docs are not accessible (HTTP $SWAGGER_RESPONSE)${NC}"
fi

# Check database connection
echo -e "\n${YELLOW}4. Checking database tables...${NC}"
DB_CHECK=$(docker exec postgres-prod psql -U postgres -d chatbot_service -c "\dt" 2>&1)
if echo "$DB_CHECK" | grep -q "conversations"; then
    echo -e "${GREEN}✓ Database tables exist${NC}"
    echo "$DB_CHECK"
else
    echo -e "${RED}✗ Database tables not found${NC}"
    echo "$DB_CHECK"
fi

# Check Ollama service
echo -e "\n${YELLOW}5. Checking Ollama service...${NC}"
if docker ps | grep -q "ollama-prod"; then
    echo -e "${GREEN}✓ Ollama container is running${NC}"
    
    # Check Ollama models
    echo -e "\n${YELLOW}6. Checking Ollama models...${NC}"
    OLLAMA_MODELS=$(docker exec ollama-prod ollama list 2>&1)
    if echo "$OLLAMA_MODELS" | grep -q "qwen2.5:3b"; then
        echo -e "${GREEN}✓ qwen2.5:3b model is available${NC}"
    else
        echo -e "${YELLOW}⚠ qwen2.5:3b model not found. Run: docker exec ollama-prod ollama pull qwen2.5:3b${NC}"
    fi
    
    if echo "$OLLAMA_MODELS" | grep -q "nomic-embed-text"; then
        echo -e "${GREEN}✓ nomic-embed-text model is available${NC}"
    else
        echo -e "${YELLOW}⚠ nomic-embed-text model not found. Run: docker exec ollama-prod ollama pull nomic-embed-text${NC}"
    fi
else
    echo -e "${RED}✗ Ollama container is not running${NC}"
fi

# Check RabbitMQ connection
echo -e "\n${YELLOW}7. Checking RabbitMQ connection...${NC}"
if docker ps | grep -q "rabbitmq-prod"; then
    echo -e "${GREEN}✓ RabbitMQ container is running${NC}"
    RABBITMQ_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -u admin:admin http://localhost:15678/api/overview)
    if [ "$RABBITMQ_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ RabbitMQ management is accessible${NC}"
    else
        echo -e "${YELLOW}⚠ RabbitMQ management not accessible (HTTP $RABBITMQ_RESPONSE)${NC}"
    fi
else
    echo -e "${RED}✗ RabbitMQ container is not running${NC}"
fi

# Check service logs for errors
echo -e "\n${YELLOW}8. Checking recent logs for errors...${NC}"
ERROR_COUNT=$(docker logs chatbot-service-v2-prod --tail 50 2>&1 | grep -i "error" | wc -l)
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ No errors found in recent logs${NC}"
else
    echo -e "${YELLOW}⚠ Found $ERROR_COUNT error(s) in recent logs${NC}"
    echo "Recent errors:"
    docker logs chatbot-service-v2-prod --tail 50 2>&1 | grep -i "error" | tail -5
fi

echo -e "\n=========================================="
echo -e "${GREEN}Verification complete!${NC}"
echo -e "\n${YELLOW}Quick Links:${NC}"
echo "  - Web UI: http://localhost:3006"
echo "  - API Docs: http://localhost:3006/api/docs"
echo "  - Health Check: http://localhost:3006/api/health"
echo "  - RabbitMQ Management: http://localhost:15678 (admin/admin)"
