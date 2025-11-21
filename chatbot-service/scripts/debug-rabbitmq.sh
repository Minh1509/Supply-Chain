#!/bin/bash

echo "🔍 RabbitMQ Debug Info"
echo "====================="

# Check RabbitMQ queues
echo ""
echo "📊 RabbitMQ Queues:"
docker exec rabbitmq-prod rabbitmqctl list_queues name messages consumers

# Check exchanges
echo ""
echo "📊 RabbitMQ Exchanges:"
docker exec rabbitmq-prod rabbitmqctl list_exchanges name type

# Check bindings for inventory_queue
echo ""
echo "📊 Bindings for inventory_queue:"
docker exec rabbitmq-prod rabbitmqctl list_bindings | grep inventory_queue | head -10

# Check chatbot logs
echo ""
echo "📊 Chatbot Service Logs (last 10 lines):"
docker logs --tail 10 chatbot-service-prod

# Test simple chat
echo ""
echo "📊 Test Simple Chat:"
curl -s -X POST http://localhost:3006/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "BOM là gì?", "userId": "test"}' | jq -r '.message' | head -c 200

echo ""
echo ""
echo "====================="
