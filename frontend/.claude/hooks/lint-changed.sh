#!/bin/bash
# PostToolUse hook: runs ESLint on the changed file after Edit/Write
# Receives tool output JSON via stdin

INPUT=$(cat)

# Extract file path from the tool input
FILE=$(echo "$INPUT" | grep -o '"file_path":"[^"]*"' | head -1 | sed 's/"file_path":"//;s/"$//')

# Only lint TypeScript/JavaScript files
if [ -n "$FILE" ] && echo "$FILE" | grep -qE '\.(ts|tsx|js|jsx)$'; then
  cd "${CLAUDE_PROJECT_DIR}" 2>/dev/null || exit 0
  npx eslint --no-error-on-unmatched-pattern "$FILE" 2>/dev/null || true
fi

exit 0