#!/usr/bin/env bash
set -euo pipefail

CONTROL_DIR="$(cd "$(dirname "$0")" && pwd)"

"$CONTROL_DIR/stop.sh" 2>/dev/null || true
"$CONTROL_DIR/start.sh"
