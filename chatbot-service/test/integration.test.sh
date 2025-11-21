#!/bin/bash

BASE_URL="http://localhost:3006/api"
CONVERSATION_ID=""

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🧪 SCMS Chatbot Integration Tests                   ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

echo "📋 Test 1: Greeting"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Xin chào"}')
echo "$RESPONSE" | jq
CONVERSATION_ID=$(echo "$RESPONSE" | jq -r '.conversationId')
echo ""

echo "📦 Test 2: Query Inventory"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Tồn kho sản phẩm ABC ở kho Hà Nội là bao nhiêu?\",
    \"conversationId\": \"$CONVERSATION_ID\"
  }" | jq
echo ""

echo "📄 Test 3: Query Sales Order"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Trạng thái đơn hàng SO-001?\",
    \"conversationId\": \"$CONVERSATION_ID\"
  }" | jq
echo ""

echo "🏭 Test 4: Query Manufacture Order"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Kiểm tra lệnh sản xuất MO-001\",
    \"conversationId\": \"$CONVERSATION_ID\"
  }" | jq
echo ""

echo "📊 Test 5: Request Report"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Báo cáo tồn kho tháng 11\",
    \"conversationId\": \"$CONVERSATION_ID\"
  }" | jq
echo ""

echo "❓ Test 6: Guide Request"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Làm sao để tạo phiếu xuất kho?\",
    \"conversationId\": \"$CONVERSATION_ID\"
  }" | jq
echo ""

echo "📝 Test 7: Create Ticket (Intent Detection)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"Tạo phiếu xuất kho 50 sản phẩm ABC\",
    \"conversationId\": \"$CONVERSATION_ID\"
  }" | jq
echo ""

echo "✅ All tests completed!"
echo ""
echo "💡 Tips:"
echo "  - Check Swagger docs: http://localhost:3006/api/docs"
echo "  - View conversation ID: $CONVERSATION_ID"
echo "  - Test with different queries to see RAG in action"
