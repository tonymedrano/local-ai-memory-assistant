#!/bin/bash

echo "======================================="
echo " Local AI Memory Assistant"
echo " Estado del sistema"
echo "======================================="

echo ""
echo "▶ Ollama"

if curl -s http://localhost:11434/api/tags >/dev/null; then
    echo "✓ Running"
else
    echo "✗ Offline"
fi

echo ""
echo "▶ Memory Service"

if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✓ Running"
else
    echo "✗ Offline"
fi

echo ""
echo "▶ Qdrant"

if curl -s http://localhost:6333 >/dev/null; then
    echo "✓ Running"
else
    echo "✗ Offline"
fi

echo ""
echo "▶ Docker"

docker compose ps

echo ""
echo "======================================="