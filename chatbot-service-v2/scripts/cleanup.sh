#!/bin/bash

# Cleanup Script for Chatbot Service V2
# Usage: bash scripts/cleanup.sh [dev|prod] [--volumes]

ENV=${1:-dev}
REMOVE_VOLUMES=${2}

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  🧹 Chatbot Service V2 - Cleanup                    ║${NC}"
echo -e "${YELLOW}║  Environment: $ENV                                    ║${NC}"
echo -e "${YELLOW}╚═══════════════════════════════════════════════════════╝${NC}"

if [ "$ENV" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    CONTAINER_NAME="chatbot-service-v2-prod"
else
    COMPOSE_FILE="docker-compose.yml"
    CONTAINER_NAME="chatbot-service-v2"
fi

# Stop services
echo -e "\n${YELLOW}Stopping services...${NC}"
docker-compose -f $COMPOSE_FILE stop chatbot-service-v2
echo -e "${GREEN}✓ Services stopped${NC}"

# Remove containers
echo -e "\n${YELLOW}Removing containers...${NC}"
docker-compose -f $COMPOSE_FILE rm -f chatbot-service-v2
echo -e "${GREEN}✓ Containers removed${NC}"

# Remove volumes if requested
if [ "$REMOVE_VOLUMES" = "--volumes" ]; then
    echo -e "\n${RED}⚠️  Removing volumes (data will be lost)...${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        if [ "$ENV" = "prod" ]; then
            docker volume rm ollama-data-prod 2>/dev/null || true
        else
            docker volume rm chatbot-service-v2_ollama-data 2>/dev/null || true
        fi
        echo -e "${GREEN}✓ Volumes removed${NC}"
    else
        echo -e "${YELLOW}Skipping volume removal${NC}"
    fi
fi

# Remove dangling images
echo -e "\n${YELLOW}Cleaning up dangling images...${NC}"
docker image prune -f
echo -e "${GREEN}✓ Cleanup complete${NC}"

echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Cleanup Complete!                                ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}To redeploy, run:${NC}"
echo "  bash scripts/quick-deploy.sh $ENV"
