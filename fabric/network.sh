#!/usr/bin/env bash
set -e

MODE=$1

if [ "$MODE" == "up" ]; then
    echo "[*] Bringing up Hyperledger Fabric network..."
    docker compose -f docker-compose.fabric.yml up -d 2>/dev/null || echo "[!] Docker offline: using DevLedger mode"
elif [ "$MODE" == "down" ]; then
    echo "[*] Stopping Fabric network..."
    docker compose -f docker-compose.fabric.yml down -v 2>/dev/null || true
else
    echo "Usage: ./fabric/network.sh [up|down]"
fi
