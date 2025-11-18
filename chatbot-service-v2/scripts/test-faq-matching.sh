#!/bin/bash

# Test FAQ Matching System
echo "🧪 Testing FAQ Matching System..."
echo "=================================="

API_URL="http://localhost:3006/api"

# Test cases
declare -a test_queries=(
    "Làm sao để kiểm tra tồn kho?"
    "kiem tra ton kho"
    "xem ton kho o dau"
    "Tạo phiếu xuất kho như thế nào?"
    "tao phieu xuat"
    "xuất kho"
    "BOM là gì?"
    "bom la cai gi"
    "định mức nguyên vật liệu"
    "Chatbot có thể làm gì?"
    "ban co the giup gi"
    "tính năng chatbot"
)

echo ""
echo "📋 Running ${#test_queries[@]} test cases..."
echo ""

for query in "${test_queries[@]}"; do
    echo "Query: \"$query\""
    
    response=$(curl -s -X POST "$API_URL/chat" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"$query\", \"userId\": \"test-user\"}")
    
    # Extract message from response
    message=$(echo $response | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$message" ]; then
        echo "✅ Response received"
        echo "   Preview: ${message:0:100}..."
    else
        echo "❌ No response"
    fi
    
    echo ""
    sleep 1
done

echo "=================================="
echo "✅ Test completed!"
