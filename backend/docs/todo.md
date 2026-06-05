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

## Prompt-only post/story generation — 2026-06-01

### Plan
- [x] Read affected files (aiArtifact.service, ai.service, post/content, story/content)
- [x] Safe Prisma queries with `?? []` + `.length` guards in `createArtifact`
- [x] Null-safe `getAudiences` and `getProducts` helpers
- [x] Guard `normalizeUserPromptBlock` when prompt is empty
- [x] Conditional `postBusinessContextBlock` / `storyBusinessContextBlock` (audience/products sections)
- [x] Graceful `postIdeaBlock` / `storyIdeaBlock` when no ideas provided
- [x] Remove pre-existing `console.log` in `generatePostsBasedOnBusinessProfile` and `generateStoriesBasedOnBusinessProfile`
- [x] Quality gate: backend-reviewer + backend-tester

### Notes
- Migration needed: no
- Affected modules: `aiArtifact`, `ai`
- DTO fields already `@IsOptional()` — no DTO changes needed

### Review
- [x] backend-reviewer → PASS (retry 1: fixed console.log)
- [x] backend-tester → 29/29 tests pass
- [x] No migration needed
- [x] No regressions found
- Summary: Made products, ideas, and audiences optional for AI post/story generation — when absent, the system generates content based solely on user prompt + business context

## TikTok cron silent failure fix — 2026-06-05

### Plan
- [x] Read affected files (apify.service, tiktok.service, trends.service)
- [x] Add `logger.warn` in ApifyService when dataset is empty despite SUCCEEDED status
- [x] Add warn logs in TiktokService when hashtags/videos are empty (with context)
- [x] Add `emptyCount` counter in TrendsService to distinguish empty from success
- [x] Quality gate: backend-reviewer + backend-tester

### Notes
- Migration needed: no
- Affected modules: `apify`, `tiktok`, `trends`
- Logging-only changes — zero behavior modifications
- Root cause: Apify actor `clockworks~tiktok-trends-scraper` CheerioCrawler fails to scrape TikTok (external issue), but our code treated empty dataset as success

### Review
- [x] backend-reviewer → PASS
- [x] backend-tester → 28/28 tests pass (4 new for emptyCount)
- [x] No migration needed
- [x] No regressions found
- Summary: Added warn-level logging across apify/tiktok/trends services to surface silent failures when Apify scraper returns empty datasets
