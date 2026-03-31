#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_PID_FILE="$PROJECT_DIR/control/api.pid"
VITE_PID_FILE="$PROJECT_DIR/control/guitarworld.pid"
API_LOG_FILE="$PROJECT_DIR/control/api.log"
VITE_LOG_FILE="$PROJECT_DIR/control/guitarworld.log"

# Load nvm and switch to project Node version
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    source "$NVM_DIR/nvm.sh"
    nvm use 2>/dev/null || nvm use default
fi

# Check if already running
for pf in "$API_PID_FILE" "$VITE_PID_FILE"; do
    if [[ -f "$pf" ]]; then
        PID=$(cat "$pf")
        if kill -0 "$PID" 2>/dev/null; then
            echo "guitarworld is already running (PID $PID from $pf)"
            exit 1
        fi
        rm -f "$pf"
    fi
done

cd "$PROJECT_DIR"

# Start API server (Express + MongoDB)
echo "Starting API server (MongoDB backend)..."
nohup node server/index.cjs > "$API_LOG_FILE" 2>&1 &
echo $! > "$API_PID_FILE"
echo "  API server started (PID $(cat "$API_PID_FILE"))"
echo "  API logs: $API_LOG_FILE"

# Wait briefly for API to be ready
sleep 1

# Start Vite frontend server
echo "Starting Vite frontend..."
nohup npx vite --host 0.0.0.0 --port 3000 --strictPort > "$VITE_LOG_FILE" 2>&1 &
echo $! > "$VITE_PID_FILE"
echo "  Vite started (PID $(cat "$VITE_PID_FILE"))"
echo "  Vite logs: $VITE_LOG_FILE"

echo ""
echo "guitarworld is running:"
echo "  Frontend: http://0.0.0.0:3000"
echo "  API:      http://localhost:3001"
echo "  MongoDB:  mongodb://10.5.109.14:27017/guitarworld"
