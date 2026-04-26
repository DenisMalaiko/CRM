# Task Log

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
