#!/bin/bash
# PostToolUse hook: sends macOS notification after successful git commit

INPUT=$(cat)

COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | sed 's/"command":"//;s/"$//')

if echo "$COMMAND" | grep -q "git commit"; then
  STDOUT=$(echo "$INPUT" | grep -o '"stdout":"[^"]*"' | sed 's/"stdout":"//;s/"$//')
  if echo "$STDOUT" | grep -qE '(create mode|file changed|files changed|insertion|deletion)'; then
    SUMMARY=$(echo "$STDOUT" | head -1)
    osascript -e "display notification \"$SUMMARY\" with title \"Git Commit\" sound name \"Glass\"" 2>/dev/null || true
  fi
fi

exit 0