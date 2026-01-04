# CRM

## Run Project
```docker-compose up -d --build```

## Stop Project
```docker-compose down```

## Clear Cache
```docker system prune -af --volumes```

## Generate prisma schema
```npx prisma generate```




# Reset DB
- Add vector to 1st migration script ```CREATE EXTENSION IF NOT EXISTS vector;```
- Refresh all migrations ```npx prisma migrate reset```