---
name: create-page
description: "Create a new page with full boilerplate: component, route registration, and optional Redux slice. Use when adding a new route/page to the application."
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Create New Page

Create a complete new page named `$ARGUMENTS` with all necessary boilerplate.

## Process

1. **Ask** the user:
   - Which route group? (public, admin, authenticated/profile)
   - What URL path? (e.g., `/profile/competitors`)
   - Does it need a Redux slice + RTK Query API?
   - Does it need navigation link in sidebar/header?

2. **Create page component** at the appropriate location:
   - Public → `src/pages/home/`
   - Admin → `src/pages/admin/`
   - Authenticated → `src/pages/admin/` (under business sub-routes)

```tsx
import React from 'react';

type Props = {};

export function PageName({}: Props) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Page Title</h1>
      {/* TODO: implement */}
    </div>
  );
}
```

3. **Register route** — read `src/router/` files and add the new route following existing patterns

4. **Create Redux slice** (if requested) — follow `/new-slice` command pattern

5. **Add navigation** (if requested) — find the sidebar/header component and add link

6. Follow all rules from `.claude/rules/react-conventions.md` and `.claude/rules/file-structure.md`