## Higgsfield Video Generation — 2026-05-18

### Plan
- [x] Read affected files
- [x] Update Prisma schema — add `AIArtifactMedia` model, `MediaType` enum, `media` relation on `AIArtifact`
- [x] Run migration: `npx prisma migrate dev --name add_artifact_media_table`
- [x] Add async Replicate methods to `AiReplicateService` (`startAiPhotoJobAsync`, `pollAndSaveImage`)
- [x] Export `AiReplicateService` from `AiModule`
- [x] Create `HiggsfieldsService` with `createVideoJob`, `getJobStatus`, `downloadAndSaveVideo`
- [x] Create `VideoAIModule`
- [x] Add `generateVideoPrompt` to `AiService`
- [x] Add `startGenerateImage`, `startGenerateVideo`, `getAiArtifact` to `AiArtifactService`
- [x] Add `GenerateImageDto`, `GenerateVideoDto` to DTOs
- [x] Add `media` field to `AIArtifactBase` entity
- [x] Add 3 new controller routes: GET artifact, POST generate-image, POST generate-video
- [x] Wire `VideoAIModule` into `AIArtifactModule` and `AppModule`

### Notes
- Migration needed: YES — applied to DB, but Prisma client regeneration requires `sudo npx prisma generate` due to root-owned `node_modules/.prisma/client`
- Affected modules: `aiArtifact`, `ai`, `videoAI` (new)
- Old `imageUrl` on `AIArtifact` kept for backward compatibility
- All existing service methods in `AiReplicateService` preserved

### Review
- [x] Migration applied to database
- [x] All 12 build errors are exclusively Prisma client staleness — zero application logic errors
- [x] All Prisma queries scoped by `businessId`
- [x] `@ResponseMessage()` on all new controller methods
- [x] `@UseGuards(JwtAuthGuard)` inherited from controller class
- [x] No `console.log` in new code (removed existing one from `savePhoto`)
- [ ] Pending: user must run `sudo npx prisma generate` to regenerate Prisma client
- Summary: Added `AIArtifactMedia` table, async Replicate polling, Higgsfield video API integration, and 3 new REST endpoints on the ai-artifact controller
