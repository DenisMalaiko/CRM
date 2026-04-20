# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev     # Dev server with hot reload
npm run build         # Compile TypeScript
npm run start:prod    # Run compiled output
npm run lint          # ESLint with auto-fix
npm run format        # Prettier format
npm run test          # Unit tests
npm run test:watch    # Unit tests in watch mode
npm run test:cov      # Unit tests with coverage
npm run test:e2e      # End-to-end tests

npx prisma generate                              # Regenerate Prisma client after schema changes
npx prisma migrate dev --name <migration-name>   # Create and apply a new migration
```

## Architecture

NestJS 11 + TypeScript backend with PostgreSQL (Prisma ORM), JWT auth, and AI integrations.

### Request Lifecycle

Every response is wrapped by `ApiResponseInterceptor` (`src/core/interceptors/`) into `{ success, statusCode, message, data }`. Use the `@ResponseMessage()` decorator on route handlers to set the `message` field.

Protected routes use `@UseGuards(JwtAuthGuard)` — the guard extracts and validates the Bearer JWT, then attaches the decoded user to `request.user`.

### Module Pattern

All feature modules live in `src/modules/`. Each follows:
- `*.controller.ts` — route handlers, guards, DTOs
- `*.service.ts` — business logic, Prisma calls
- `*.dto.ts` — request validation via class-validator
- `*.entity.ts` — TypeScript types for Prisma model shapes

### Core Infrastructure (`src/core/`)

- `prisma/` — `PrismaService` (extends PrismaClient, used everywhere as the DB layer)
- `guards/jwt-auth.guard.ts` — JWT verification
- `interceptors/api-response.interceptor.ts` — Response envelope
- `decorators/response-message.decorator.ts` — Sets response message via Reflector
- `s3/` — AWS S3 upload helpers
- `storage/` — Storage URL resolution

### AI Integrations

- **LangChain + OpenAI** (`gpt-4o-mini`) — text generation in `ai` and `ideaAI` modules
- **Replicate** — image generation
- **OpenAI embeddings** — stored as vectors in PostgreSQL (requires `vector` extension); used in the `products` module for semantic search

### Database

Prisma schema at `prisma/schema.prisma`. Key model relationships:
- `Agency` → `User[]`, `Business[]`
- `Business` → `BusinessProfile[]`, `Competitor[]`, `Product[]`, `Prompt[]`, `Idea[]`
- `BusinessProfile` → platforms, audiences, products, tags
- `AIArtifact` — generated content with status tracking

After any schema change: `npx prisma generate`, then create a migration.

### Auth Flow

JWT access token (1h) + refresh token (30d httpOnly cookie). Tokens use `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` from env.

### API Docs

Swagger UI available at `/docs` when running locally.
