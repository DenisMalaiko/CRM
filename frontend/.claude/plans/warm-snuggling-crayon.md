# Upload Design System from Photo — План імплементації

## Контекст

Користувач хоче завантажити фото свого бренду/дизайну, щоб AI проаналізував зображення та створив кастомну дизайн-систему на базі полів, які вже використовуються в пресетах (`TDesignSystem`). Модель вже має `source: "AI_PHOTO"` — тип передбачений, але ще не реалізований у фронтенді.

## Що змінюється

### 1. Новий API endpoint — `designSystemApi.ts`
**Файл:** `src/store/designSystem/designSystemApi.ts`

Додати mutation `createDesignSystemFromPhoto`:
- `POST /design-systems/from-photo`
- Тіло: `FormData` з полями `file` (зображення), `businessId`, `name`
- Відповідь: `ApiResponse<TDesignSystem>`
- Експортувати хук `useCreateDesignSystemFromPhotoMutation`

### 2. Новий компонент діалогу — `UploadDesignSystemDlg.tsx`
**Файл:** `src/pages/admin/business/components/Assets/Gallery/components/designSystem/UploadDesignSystemDlg.tsx`

Діалог для завантаження фото:
- **Props:** `{ open: boolean; onClose: () => void }`
- **Стан:** `file: File | null`, `preview: string | null`, `name: string`
- **Валідація:** `isValidPhoto(file)` з `src/utils/validations.ts`
- **Preview:** `URL.createObjectURL(file)` з cleanup через `revokeObjectURL`
- **Submit:** FormData з `file`, `businessId` (з `useParams`), `name`
- **Після успіху:** `dispatch(addBusinessSystem(res.data))`, toast success, close

**UI структура** (за паттерном проекту):
- Overlay: `fixed inset-0 z-50 bg-slate-900/50`
- Контейнер: `max-w-lg rounded-2xl bg-white shadow-xl`
- Header: заголовок + кнопка закриття (X, синій rounded-full)
- Body: поле "Name" (text input), зона завантаження (file input + preview), підказка
- Footer: Cancel + Create (з loading spinner "Analyzing...")
- Guard: `if (!open) return null`

### 3. Модифікація заголовка сторінки — `DesignSystem.tsx`
**Файл:** `src/pages/admin/business/components/Assets/Gallery/DesignSystem.tsx`

Зміни в header секції (рядки 141-148):
- Обгорнути в `flex items-center justify-between`
- Ліва частина: існуючі h2 + p (без змін)
- Права частина: кнопка "Upload" з іконкою `Upload` (lucide-react)
- Стиль кнопки: `bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700`
- Стан `uploadDlgOpen` + рендер `UploadDesignSystemDlg`

## Файли для зміни

| Файл | Дія |
|------|-----|
| `src/store/designSystem/designSystemApi.ts` | Додати endpoint + експорт хука |
| `src/pages/.../designSystem/UploadDesignSystemDlg.tsx` | Новий файл — діалог завантаження |
| `src/pages/.../Gallery/DesignSystem.tsx` | Додати кнопку в header + підключити діалог |

## Верифікація

1. `npm start` — перевірити що сторінка Design System рендериться з кнопкою Upload
2. Клік на кнопку — діалог відкривається
3. Завантаження фото — preview відображається, валідація працює
4. Submit — запит йде на `/design-systems/from-photo`, loading стан показується
5. Після успіху — нова дизайн-система з'являється в "My Design Systems"
6. Quality gate: reviewer + tester
