#!/bin/bash

# Benchmark FAQ Matching Performance
echo "⚡ FAQ Matching Performance Benchmark"
echo "====================================="

API_URL="http://localhost:3006/api/rag"

# Test exact matches
echo ""
echo "📊 Test 1: Exact Matches (should be ~1.0 score)"
echo "------------------------------------------------"

exact_queries=(
    "Làm sao để kiểm tra tồn kho?"
    "BOM là gì?"
    "Chatbot có thể làm gì?"
)

for query in "${exact_queries[@]}"; do
    start=$(date +%s%N)
    response=$(curl -s -X POST "$API_URL/test-faq-match" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}")
    end=$(date +%s%N)
    
    duration=$(( (end - start) / 1000000 ))
    score=$(echo $response | grep -o '"score":[0-9.]*' | cut -d':' -f2)
    
    echo "✓ \"$query\""
    echo "  Score: $score | Time: ${duration}ms"
done

# Test fuzzy matches
echo ""
echo "📊 Test 2: Fuzzy Matches (no diacritics)"
echo "------------------------------------------------"

fuzzy_queries=(
    "kiem tra ton kho"
    "bom la gi"
    "chatbot co the lam gi"
)

for query in "${fuzzy_queries[@]}"; do
    start=$(date +%s%N)
    response=$(curl -s -X POST "$API_URL/test-faq-match" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}")
    end=$(date +%s%N)
    
    duration=$(( (end - start) / 1000000 ))
    score=$(echo $response | grep -o '"score":[0-9.]*' | cut -d':' -f2)
    
    echo "✓ \"$query\""
    echo "  Score: $score | Time: ${duration}ms"
done

# Test partial matches
echo ""
echo "📊 Test 3: Partial Matches"
echo "------------------------------------------------"

partial_queries=(
    "ton kho"
    "xuat kho"
    "don hang"
)

for query in "${partial_queries[@]}"; do
    response=$(curl -s -X POST "$API_URL/test-faq-match" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}")
    
    score=$(echo $response | grep -o '"score":[0-9.]*' | cut -d':' -f2)
    question=$(echo $response | grep -o '"question":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    echo "✓ \"$query\""
    echo "  Matched: \"$question\""
    echo "  Score: $score"
done

echo ""
echo "====================================="
echo "✅ Benchmark completed!"
