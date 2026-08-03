#!/bin/bash
# PreToolUse hook: blocks Edit/Write to protected files
# Exit 0 = allow, Exit 2 = deny

INPUT=$(cat)

FILE=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | sed 's/"file_path":"//;s/"$//')

[ -z "$FILE" ] && exit 0

BASENAME=$(basename "$FILE")

# Block .env files
if echo "$BASENAME" | grep -qE '^\.env'; then
  echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"Blocked: cannot modify environment file: $BASENAME\"}}"
  exit 2
fi

# Block critical config files
PROTECTED_CONFIGS=(
  "package.json"
  "package-lock.json"
  "tsconfig.json"
  ".claude/settings.json"
  ".claude/settings.local.json"
)

for config in "${PROTECTED_CONFIGS[@]}"; do
  if echo "$FILE" | grep -q "$config"; then
    echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"Blocked: cannot modify protected config: $config. Ask the user to confirm.\"}}"
    exit 2
  fi
done

exit 0
