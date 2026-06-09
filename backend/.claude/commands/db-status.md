Check the current database and Prisma state:

1. Run `npx prisma validate` to check schema validity
2. Run `npx prisma migrate status` to see pending migrations
3. Compare `prisma/schema.prisma` with the current migration state
4. Report: schema valid/invalid, pending migrations (if any), drift warnings

Output a short summary with actionable next steps if issues found.
