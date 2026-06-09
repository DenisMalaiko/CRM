Create a new React component named `$ARGUMENTS` following the project conventions.

## Steps

1. Ask me whether this is a **shared** component (used on 2+ pages → `src/components/`) or **page-local** (used on one page → ask which page directory)
2. Create the component file with this template:

```tsx
import React from 'react';

type Props = {
  // TODO: define props
};

export function $ARGUMENTS({}: Props) {
  return (
    <div>
      {/* TODO: implement */}
    </div>
  );
}
```

3. If I specify props or behavior — implement them immediately
4. Follow all rules from `.claude/rules/react-conventions.md` and `.claude/rules/file-structure.md`
