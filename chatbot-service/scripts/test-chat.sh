#!/bin/bash

BASE_URL="http://localhost:3006/api"

echo "🤖 Testing Chatbot Service..."
echo ""

echo "Test 1: Tra cứu tồn kho"
curl -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tồn kho sản phẩm ABC ở kho Hà Nội là bao nhiêu?"
  }' | jq

echo ""
echo "Test 2: Kiểm tra đơn hàng"
curl -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Trạng thái đơn hàng SO-001?"
  }' | jq

echo ""
echo "Test 3: Hướng dẫn"
curl -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Làm sao để tạo phiếu xuất kho?"
  }' | jq

echo ""
echo "✅ Tests complete!"
