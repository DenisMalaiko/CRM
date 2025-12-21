## Generate Prisma
```npx prisma generate```

## Add New Table
```npx prisma migrate dev --name add-table-model```

## Reset DB

#### Delete migrations
```rm -rf prisma/migrations```

```npx prisma migrate reset```

```psql -U postgres -d crm```

```CREATE EXTENSION IF NOT EXISTS vector```

```\q```

```npx prisma generate```

```npx prisma migrate dev --name init```