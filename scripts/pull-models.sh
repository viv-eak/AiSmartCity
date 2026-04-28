#!/bin/bash
echo "Pulling Ollama models..."
docker exec smartcity-ollama ollama pull llama3
docker exec smartcity-ollama ollama pull nomic-embed-text
echo "Models pulled successfully!"
