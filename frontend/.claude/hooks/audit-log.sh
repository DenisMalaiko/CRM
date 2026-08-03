#!/bin/bash
# UserPromptSubmit hook: logs each user prompt with timestamp

INPUT=$(cat)

PROMPT=$(echo "$INPUT" | grep -o '"prompt":"[^"]*"' | sed 's/"prompt":"//;s/"$//')

[ -z "$PROMPT" ] && exit 0

LOG_DIR="${CLAUDE_PROJECT_DIR}/docs/audit"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/$(date +%Y-%m).log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] $PROMPT" >> "$LOG_FILE"

exit 0
