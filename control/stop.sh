#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_PID_FILE="$PROJECT_DIR/control/api.pid"
VITE_PID_FILE="$PROJECT_DIR/control/guitarworld.pid"

stopped_any=false

stop_process() {
    local name="$1"
    local pid_file="$2"

    if [[ ! -f "$pid_file" ]]; then
        echo "$name: not running (no PID file)"
        return
    fi

    local pid
    pid=$(cat "$pid_file")

    if ! kill -0 "$pid" 2>/dev/null; then
        echo "$name: not running (stale PID $pid)"
        rm -f "$pid_file"
        return
    fi

    echo "Stopping $name (PID $pid)..."
    kill "$pid"

    for i in {1..10}; do
        if ! kill -0 "$pid" 2>/dev/null; then
            break
        fi
        sleep 0.5
    done

    if kill -0 "$pid" 2>/dev/null; then
        echo "  $name didn't stop gracefully, forcing..."
        kill -9 "$pid" 2>/dev/null || true
    fi

    rm -f "$pid_file"
    echo "  $name stopped"
    stopped_any=true
}

# Stop Vite first (frontend), then API server (backend)
stop_process "Vite frontend" "$VITE_PID_FILE"
stop_process "API server" "$API_PID_FILE"

if [[ "$stopped_any" = false ]]; then
    echo "guitarworld was not running"
else
    echo "guitarworld stopped"
fi
