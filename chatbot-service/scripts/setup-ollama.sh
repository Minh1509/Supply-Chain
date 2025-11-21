#!/bin/bash

echo "🚀 Setting up Ollama models for chatbot..."

echo "📥 Pulling Qwen2.5:3b model..."
ollama pull qwen2.5:3b

echo "📥 Pulling nomic-embed-text model..."
ollama pull nomic-embed-text

echo "✅ Ollama setup complete!"
echo ""
echo "Test with:"
echo "  ollama run qwen2.5:3b 'Xin chào'"
