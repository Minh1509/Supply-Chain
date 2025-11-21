#!/bin/bash

# Test RabbitMQ Integration with All Services
echo "🧪 Testing RabbitMQ Integration"
echo "================================"

API_URL="http://localhost:3006/api/chat"

# Test 1: Inventory Service
echo ""
echo "📦 Test 1: Inventory Service"
echo "----------------------------"
echo "Query: Tồn kho sản phẩm 1 ở kho 1"

response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tồn kho sản phẩm 1 ở kho 1 là bao nhiêu?",
    "userId": "test-user"
  }')

echo "$response" | grep -o '"message":"[^"]*"' | head -1
echo ""

# Test 2: General Service (Item)
echo "📋 Test 2: General Service - Get Item"
echo "--------------------------------------"
echo "Query: Thông tin sản phẩm 1"

response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Cho tôi thông tin về sản phẩm có ID 1",
    "userId": "test-user"
  }')

echo "$response" | grep -o '"message":"[^"]*"' | head -1
echo ""

# Test 3: Business Service (Sales Order)
echo "💼 Test 3: Business Service - Sales Order"
echo "-----------------------------------------"
echo "Query: Đơn hàng SO-1"

response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Kiểm tra đơn hàng SO-1",
    "userId": "test-user"
  }')

echo "$response" | grep -o '"message":"[^"]*"' | head -1
echo ""

# Test 4: Operation Service (Manufacture Order)
echo "⚙️  Test 4: Operation Service - Manufacture"
echo "------------------------------------------"
echo "Query: Lệnh sản xuất MO-1"

response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Trạng thái lệnh sản xuất MO-1",
    "userId": "test-user"
  }')

echo "$response" | grep -o '"message":"[^"]*"' | head -1
echo ""

# Test 5: FAQ (should work without RabbitMQ)
echo "❓ Test 5: FAQ System (No RabbitMQ)"
echo "-----------------------------------"
echo "Query: BOM là gì?"

response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "BOM là gì?",
    "userId": "test-user"
  }')

echo "$response" | grep -o '"message":"[^"]*"' | head -1
echo ""

echo "================================"
echo "✅ Test completed!"
echo ""
echo "💡 Check if responses contain:"
echo "   - FAQ: Direct answer from FAQs"
echo "   - Services: Real data or 'Dữ liệu mẫu'"
