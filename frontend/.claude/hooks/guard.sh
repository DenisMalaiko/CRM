#!/bin/bash
# PreToolUse hook: blocks destructive bash commands
# Exit 0 = allow, Exit 2 = deny

# Read tool input from stdin
INPUT=$(cat)

# Extract the command from the tool input
COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | sed 's/"command":"//;s/"$//')

# Patterns to block
BLOCKED_PATTERNS=(
  "rm -rf"
  "rm -fr"
  "git push --force"
  "git push -f"
  "git reset --hard"
  "git clean -fd"
  "git checkout -- ."
  "drop table"
  "DROP TABLE"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qi "$pattern"; then
    echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"Blocked destructive command: $pattern\"}}"
    exit 2
  fi
done

exit 0
