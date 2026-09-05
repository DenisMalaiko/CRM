# Task Log

## TopAdsBlock — Top Ads блок на Facebook Dashboard — 2026-09-04

### Plan
- [x] Prisma schema — додати `topAds Json @default("[]")` до CompetitorFacebookReport
- [x] Backend: fetchAdsData() — зібрати topAds (title, adId, format, url, image, activeDays), sorted by activeDays desc, top 10
- [x] Backend: competitor.service.ts — зберігати topAds в upsert + catch block
- [x] Frontend: додати TTopAd тип + topAds до TCompetitorFacebookReport
- [x] Frontend: створити TopAdsBlock компонент (grid 5 col, ad cards)
- [x] Frontend: інтегрувати в BusinessDashboard Facebook tab
- [x] Quality gate: reviewer + tester

### Review
- [x] reviewer → PASS (after fixes: compound key for ad cards, topAds field in test fixture)
- [x] tester → 13 TopAdsBlock + 7 CompetitorCtaBlock tests pass (20 total)
- [x] tsc → 0 errors
- [x] No regressions found
- Summary: Новий компонент TopAdsBlock агрегує top 10 реклам з усіх конкурентів, відсортованих по activeDays. Дані зберігаються як JSON в CompetitorFacebookReport — без додаткових API викликів.

### Notes
- topAds зберігається як JSON аналогічно topAdTexts — дані збираються під час fetchAdsData()
- Зображення: перше image з snapshot, або video preview thumbnail
- activeDays розраховується через існуючий _active_days() helper
- Prisma migrate applied, prisma generate потребує рестарту бекенду

---

## CompetitorCtaBlock — Call To Actions блок на Facebook Dashboard — 2026-09-04

### Plan
- [x] Створити CompetitorCtaBlock компонент (агрегація CTA з усіх конкурентів)
- [x] Інтегрувати в BusinessDashboard Facebook tab
- [x] Quality gate: reviewer + tester

### Review
- [x] reviewer → PASS (1 suggestion: pre-existing unused `err` param — not introduced)
- [x] tester → 8 tests pass
- [x] tsc → 0 errors
- [x] No regressions found
- Summary: Новий компонент CompetitorCtaBlock агрегує 5 CTA категорій з усіх конкурентів у єдиний блок. Стилістика відповідає TopAdTexts, кольори — AdsCtaChart.

### Notes
- Агрегація через useMemo всередині компонента, не в батьківському BusinessDashboard
- Кольорова схема: Website=#10b981, Direct Message=#fbbf24, Instagram Page=#3b82f6, Product=#8b5cf6, Meta Page=#6b7280

---

## Add CTA + format counts to CompetitorFacebookReport — 2026-09-04

### Plan
- [x] Prisma schema — додати 9 полів (5 CTA + 4 формати) до CompetitorFacebookReport
- [x] Backend: competitor.service.ts — зберігати нові поля в upsert + fix catch block (adsDcoCount)
- [x] Frontend: оновити TCompetitorFacebookReport модель
- [x] Quality gate: reviewer + tester

### Review
- [x] reviewer → PASS (suggestion: ads/ads30d naming divergence from activeAds/activeAds30d — pre-existing, not introduced)
- [x] tester → 319 pass, 60 pre-existing failures (unrelated: missing holidaysApi module, DatePicker mock, SidebarNav structure)
- [x] tsc --noEmit → 0 errors
- [x] No regressions found
- Summary: Додано 9 полів (5 CTA категорій + 4 ad формати) до CompetitorFacebookReport. Дані вже рахувались у fetchAdsData() — тепер зберігаються в БД та повертаються на фронтенд.

### Notes
- fetchAdsData() вже рахувала ці дані — вони просто не зберігались
- Паритет з бізнес FacebookReport моделлю
- Prisma migrate applied, prisma generate потребує рестарту бекенду
- Також виправлено відсутній adsDcoCount в catch block

---

## Stories Formats (90D) — donut chart для Instagram tab — 2026-08-14

### Plan
- [x] Backend: Prisma schema — додати storiesImageCount, storiesVideoCount до InstagramReport
- [x] Backend: замінити fetchStoriesCount → fetchStoriesTypeCounts в InstagramService
- [x] Backend: оновити business.service.ts — використати новий метод
- [x] Backend: оновити TInstagramReport entity тип
- [x] Backend: оновити competitor.service.ts — адаптувати до перейменованого методу
- [x] Frontend: оновити TInstagramReport модель
- [x] Frontend: створити StoriesTypeChart компонент
- [x] Frontend: інтегрувати в BusinessDashboard
- [x] Quality gate: reviewer + tester

### Review
- [x] reviewer → PASS (3 suggestions only: legend count not rendered, hardcoded hex colors justified by conic-gradient, minor indentation)
- [x] tester → 7 tests pass
- [x] tsc --noEmit → 0 errors
- [x] No regressions found
- Summary: Додано метод fetchStoriesTypeCounts() в InstagramService (Apify stories за 90 днів з розбивкою Image/Video), поля storiesImageCount та storiesVideoCount в InstagramReport. Новий компонент StoriesTypeChart відображає donut chart аналогічний до PostsFormats.

### Notes
- Stories мають лише 2 формати: Image та Video (без Carousel)
- Apify повертає поле `type` для stories так само як для постів
- Scope: тільки бізнес-акаунт, не конкуренти
- fetchStoriesTypeCounts повертає і загальний count, і розбивку — один API виклик замість двох

---

## Instagram Reels Stats — reels метрики для Dashboard — 2026-08-12

### Plan
- [x] Backend: новий метод `fetchReelsCount()` в InstagramService
- [x] Backend: Prisma schema — rename imageCount→postsImageCount, videoCount→postsVideoCount, carouselCount→postsCarouselCount, додати поле reels
- [x] Backend: оновити тип TInstagramReport + upsertInstagramReport()
- [x] Backend: оновити fetchInstagramReport() — паралельний виклик fetchReelsCount()
- [x] Frontend: оновити TInstagramReport тип
- [x] Frontend: показати reels в stat card на Dashboard
- [x] Quality gate: reviewer + tester

### Notes
- Дані з Apify actor `apify~instagram-scraper` з `resultsType: 'reels'`
- Фільтр за останні 3 місяці через `onlyPostsNewerThan`
- Рахуємо тільки кількість reels
- Reels stat card зараз показує хардкод 0

### Review
- [x] reviewer → PASS (after fix: removed unused imports Layers/Wand2/CalendarRange, changed grid-cols-4 to grid-cols-3)
- [x] tester → 7 ContentTypeChart tests pass, 0 tsc errors
- [x] No regressions found
- Summary: Додано метод fetchReelsCount() в InstagramService (Apify reels за 90 днів), поле reels в InstagramReport. Перейменовано imageCount→postsImageCount, videoCount→postsVideoCount, carouselCount→postsCarouselCount для ясності. Reels stat card тепер показує реальні дані.

---

## Content Type Distribution Chart — donut chart для Instagram tab — 2026-08-12

### Plan
- [x] Backend: новий метод `fetchContentTypeCounts()` в InstagramService
- [x] Backend: Prisma schema — imageCount, videoCount, carouselCount
- [x] Backend: оновити тип TInstagramReport + fetchInstagramReport()
- [x] Frontend: оновити TInstagramReport тип
- [x] Frontend: створити ContentTypeChart компонент (CSS donut)
- [x] Frontend: інтегрувати графік в Instagram таб
- [x] Quality gate: reviewer + tester

### Review
- [x] reviewer → PASS (after fix: removed unused `carouselPct` variable)
- [x] tester → 10 tests pass
- [x] tsc --noEmit → 0 errors
- [x] No regressions found
- Summary: CSS donut chart для розподілу типів Instagram контенту (Image/Video/Carousel). Backend рахує `productType` з Apify за останні 3 місяці, зберігає в InstagramReport. Frontend відображає conic-gradient графік з легендою.

---

## Business Dashboard — dashboard page for business profile — 2026-08-08

### Plan
- [x] Створити BusinessDashboard.tsx (stat cards + activity feed)
- [x] Додати Dashboard в sidebar та routes
- [x] Quality gate: reviewer + tester

### Review
- [x] reviewer → PASS (duplicate icon import fixed, other findings are existing codebase patterns)
- [x] tester → 21 tests pass (16 SidebarNav + 5 BusinessDashboard)
- [x] tsc --noEmit → 0 errors
- [x] No regressions found
- Summary: Dashboard сторінка з 6 stat cards та activity feed. Перший пункт у sidebar, авто-редирект при навігації до бізнесу.

---

## Accordion Sidebar — redesign business profile sidebar — 2026-08-08

### Plan
- [x] Створити SidebarNav.tsx з accordion логікою
- [x] Спростити Business.tsx — видалити sidebar код
- [x] Quality gate: reviewer + tester

### Notes
- Одна картка замість 7 окремих
- Accordion: тільки одна група відкрита
- Авто-розгортання групи з активним маршрутом
- Плавна анімація через CSS Grid

### Review
- [x] reviewer → PASS (after fixes: replaced useEffect with set-state-during-render, changed to named export)
- [x] tester → 14 tests pass
- [x] tsc --noEmit → 0 errors
- [x] No regressions found
- Summary: Sidebar перероблено з 7 окремих карток в один accordion компонент SidebarNav. Business.tsx спрощено з 342 до 37 рядків.

---

## Calendar Public Holidays — відображення свят за країною бізнесу — 2026-08-05

### Plan
- [x] Створити модель THoliday
- [x] Створити RTK Query API holidaysApi (getHolidays endpoint)
- [x] Оновити Calendar компонент: fetch + render holidays
- [x] Quality gate: reviewer + tester

### Review
- [x] reviewer → PASS (suggestions only: minor style notes)
- [x] tester → 17 tests pass (10 existing + 7 new)
- [x] tsc --noEmit → 0 errors
- [x] No regressions found
- Summary: Calendar тепер відображає публічні свята з bg-red-50 фоном та localName текстом, дані отримуються через RTK Query endpoint /holidays/:year/:countryCode, автоматично пропускається якщо у бізнесу не вказана країна.

---

## Content Plan — нова сторінка з генерацією контент-стратегії — 2026-06-19

### Plan
- [x] Створити enum ContentPlanStatus
- [x] Створити модель TContentPlan, TContentPlanGenerate, TContentPlanUpdate
- [x] Створити Redux slice contentPlanSlice
- [x] Створити RTK Query API contentPlanApi
- [x] Зареєструвати module в store
- [x] Створити GenerateContentPlanDlg (2 режими: manual / profile)
- [x] Створити UpdateContentPlanDlg
- [x] Створити сторінку ContentPlan з таблицею
- [x] Додати пункт sidebar "Content Plan"
- [x] Додати route в App.tsx
- [x] Quality gate: reviewer + tester

### Review
- [x] reviewer → PASS (after fixes: removed `any` types, moved static arrays outside components, added generic types to Select)
- [x] tester → 55 tests pass (5 test suites)
- [x] tsc --noEmit → 0 errors
- [x] No regressions found
- Summary: Нова сторінка Content Plan з таблицею (Title, Description, Status, Mode, Created At), попапом генерації з radio-перемиканням manual/profile, та попапом редагування.

---

## CreateAiPhotoDlg + AiPhoto cleanup — 2026-04-25

### Plan
- [x] Оновити TAIGalleryPhotoCreate (photosIds, defaultPhotosIds)
- [x] SelectGalleryDlg: focus nullable (BusinessProfileFocus | null)
- [x] Реалізувати CreateAiPhotoDlg (prompt + photo selection + generate)
- [x] Очистити AiPhoto.tsx: видалити закоментований код, відновити grid, підключити діалог
- [x] Quality gate: reviewer + tester

### Review
- [x] reviewer → PASS
- [x] tester → 32 тести pass
- [x] No regressions found
- Summary: CreateAiPhotoDlg реалізовано як popup з textarea та SelectGalleryDlg(focus=null); AiPhoto очищено від закоментованого коду, grid відновлено, delete логіка відновлена.

---


## SelectGalleryDlg — inline block з навігацією — 2026-04-25

### Plan
- [x] Read affected files
- [x] Refactor SelectGalleryDlg: remove portal/modal, add category navigation, immediate selection
- [x] Update CreateCreativeDlg: remove button trigger + openGalleryDlg state
- [x] Update CreateProfileDlg: same changes
- [x] Quality gate: reviewer + tester

### Review
- [x] reviewer → PASS
- [x] tester → 13/13 tests pass
- [x] No regressions found
- Summary: SelectGalleryDlg переведено з модального попапу в inline-блок з двома режимами (overview категорій / detail фото), immediate selection через onSelect у toggle updater.
