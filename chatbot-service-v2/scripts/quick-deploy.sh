#!/bin/bash

# Quick Deploy Script for Chatbot Service V2
# Usage: bash scripts/quick-deploy.sh [dev|prod]

set -e

ENV=${1:-dev}
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🚀 Chatbot Service V2 - Quick Deploy               ║${NC}"
echo -e "${GREEN}║  Environment: $ENV                                    ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"

if [ "$ENV" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    CONTAINER_NAME="chatbot-service-v2-prod"
    OLLAMA_CONTAINER="ollama-prod"
else
    COMPOSE_FILE="docker-compose.yml"
    CONTAINER_NAME="chatbot-service-v2"
    OLLAMA_CONTAINER="ollama"
fi

# Step 1: Build
echo -e "\n${YELLOW}Step 1: Building Docker image...${NC}"
if [ "$ENV" = "prod" ]; then
    docker-compose -f $COMPOSE_FILE build chatbot-service-v2
else
    docker-compose -f $COMPOSE_FILE build
fi
echo -e "${GREEN}✓ Build complete${NC}"

# Step 2: Start infrastructure
echo -e "\n${YELLOW}Step 2: Starting infrastructure services...${NC}"
if [ "$ENV" = "prod" ]; then
    docker-compose -f $COMPOSE_FILE up -d postgres rabbitmq redis
    echo "Waiting for services to be healthy..."
    sleep 10
else
    docker-compose -f $COMPOSE_FILE up -d postgres rabbitmq
    sleep 5
fi
echo -e "${GREEN}✓ Infrastructure started${NC}"

# Step 3: Start Ollama
echo -e "\n${YELLOW}Step 3: Starting Ollama service...${NC}"
docker-compose -f $COMPOSE_FILE up -d ollama
sleep 5
echo -e "${GREEN}✓ Ollama started${NC}"

# Step 4: Pull Ollama models
echo -e "\n${YELLOW}Step 4: Pulling Ollama models...${NC}"
echo "This may take a few minutes..."

if docker exec $OLLAMA_CONTAINER ollama list | grep -q "qwen2.5:3b"; then
    echo -e "${GREEN}✓ qwen2.5:3b already exists${NC}"
else
    echo "Pulling qwen2.5:3b..."
    docker exec $OLLAMA_CONTAINER ollama pull qwen2.5:3b
    echo -e "${GREEN}✓ qwen2.5:3b pulled${NC}"
fi

if docker exec $OLLAMA_CONTAINER ollama list | grep -q "nomic-embed-text"; then
    echo -e "${GREEN}✓ nomic-embed-text already exists${NC}"
else
    echo "Pulling nomic-embed-text..."
    docker exec $OLLAMA_CONTAINER ollama pull nomic-embed-text
    echo -e "${GREEN}✓ nomic-embed-text pulled${NC}"
fi

# Step 5: Start chatbot service
echo -e "\n${YELLOW}Step 5: Starting Chatbot Service...${NC}"
docker-compose -f $COMPOSE_FILE up -d chatbot-service-v2
echo "Waiting for service to start..."
sleep 10
echo -e "${GREEN}✓ Chatbot Service started${NC}"

# Step 6: Verify deployment
echo -e "\n${YELLOW}Step 6: Verifying deployment...${NC}"

# Check container status
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${GREEN}✓ Container is running${NC}"
else
    echo -e "${RED}✗ Container is not running${NC}"
    echo "Checking logs..."
    docker logs $CONTAINER_NAME --tail 50
    exit 1
fi

# Check health endpoint
sleep 5
if curl -s http://localhost:3006/api/health > /dev/null; then
    echo -e "${GREEN}✓ Health endpoint is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Health endpoint not yet accessible, checking logs...${NC}"
    docker logs $CONTAINER_NAME --tail 20
fi

# Step 7: Show status
echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Deployment Complete!                             ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}📊 Service Status:${NC}"
docker-compose -f $COMPOSE_FILE ps

echo -e "\n${YELLOW}🔗 Quick Links:${NC}"
echo "  - Web UI: http://localhost:3006"
echo "  - API Docs: http://localhost:3006/api/docs"
echo "  - Health Check: http://localhost:3006/api/health"

if [ "$ENV" = "prod" ]; then
    echo "  - RabbitMQ Management: http://localhost:15678 (admin/admin)"
else
    echo "  - RabbitMQ Management: http://localhost:15672 (admin/admin)"
fi

echo -e "\n${YELLOW}📝 Useful Commands:${NC}"
echo "  - View logs: docker logs -f $CONTAINER_NAME"
echo "  - Stop service: docker-compose -f $COMPOSE_FILE stop chatbot-service-v2"
echo "  - Restart service: docker-compose -f $COMPOSE_FILE restart chatbot-service-v2"
echo "  - Run verification: bash scripts/verify-deployment.sh"

echo -e "\n${GREEN}Happy chatting! 🤖${NC}"
