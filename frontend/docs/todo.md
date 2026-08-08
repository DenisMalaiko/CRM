# Task Log

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
