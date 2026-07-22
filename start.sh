#!/bin/bash

set -e

echo "=========================================="
echo "   Local AI Memory Assistant"
echo "=========================================="

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "▶ Comprobando Ollama..."

if ! pgrep -x "ollama" >/dev/null; then
    echo "Iniciando Ollama..."
    ollama serve >/tmp/ollama.log 2>&1 &
    sleep 3
else
    echo "Ollama ya está ejecutándose."
fi

echo ""
echo "▶ Comprobando Qdrant..."

if ! curl -s http://localhost:6333 >/dev/null; then
    echo "⚠ Qdrant no responde."
    echo "Inícialo antes de continuar."
else
    echo "Qdrant OK"
fi

echo ""
echo "▶ Arrancando Memory Service..."

cd "$ROOT_DIR"

if lsof -i :3000 >/dev/null; then
    echo "Memory Service ya está ejecutándose."
else
    npm run dev &
    MEMORY_PID=$!
    echo "Memory Service PID: $MEMORY_PID"
fi

echo ""
echo "Esperando a que el servicio esté disponible..."

until curl -s http://localhost:3000/context \
    -H "Content-Type: application/json" \
    -d '{"query":"test"}' >/dev/null 2>&1
do
    sleep 1
done

echo ""
echo "=========================================="
echo " Sistema listo"
echo "=========================================="
echo ""
echo "Servicios:"
echo "  ✓ Ollama"
echo "  ✓ Qdrant"
echo "  ✓ Memory Service"
echo ""
echo "Ya puedes abrir VS Code y usar Continue Agent."