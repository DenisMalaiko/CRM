#!/bin/bash
# PostToolUse hook: runs TypeScript type check after Write on .ts/.tsx files
# Only triggers on Write (new files) to avoid slowing down every Edit

INPUT=$(cat)

TOOL=$(echo "$INPUT" | grep -o '"tool_name":"[^"]*"' | sed 's/"tool_name":"//;s/"$//')

# Only run on Write (new file creation), skip Edit
[ "$TOOL" != "Write" ] && exit 0

FILE=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | sed 's/"file_path":"//;s/"$//')

if [ -n "$FILE" ] && echo "$FILE" | grep -qE '\.(ts|tsx)$'; then
  cd "${CLAUDE_PROJECT_DIR}" 2>/dev/null || exit 0
  OUTPUT=$(npx tsc --noEmit --pretty 2>&1 | head -30)
  if [ -n "$OUTPUT" ]; then
    echo "$OUTPUT"
  fi
fi

exit 0
