# Calendar Public Holidays

## Context

The calendar component (`ContentPlan/Calendar/Calendar.tsx`) currently displays a static monthly grid with no events. Businesses have a `country` field (ISO alpha-2 code) that maps to their geographic location. We want to show public holidays in the calendar based on the business's country, helping users plan content around important dates.

**Data source:** [Nager.Date API](https://date.nager.at) — `GET /api/v3/PublicHolidays/{year}/{countryCode}`

## Design

### Data Model

New type `THoliday` in `src/models/Holiday.ts`:

```typescript
export type THoliday = {
  date: string;        // "2026-01-01"
  localName: string;   // "Новий Рік"
  name: string;        // "New Year's Day"
  countryCode: string; // "UA"
}
```

### API Layer

**Backend** (separate NestJS module — out of frontend scope):
- `GET /holidays/:year/:countryCode` — proxies to Nager.Date API, caches results in DB

**Frontend** — new RTK Query API `src/store/holidays/holidaysApi.ts`:
- Endpoint: `getHolidays` query — `{ year: number; countryCode: string }` → `THoliday[]`
- URL: `/holidays/${year}/${countryCode}`
- Exported hook: `useGetHolidaysQuery`
- Skip when `countryCode` is empty

### Calendar UI Changes

File: `src/pages/admin/business/components/ContentPlan/Calendar/Calendar.tsx`

1. Receive `countryCode` from current business (prop or Redux selector)
2. Call `useGetHolidaysQuery({ year, countryCode }, { skip: !countryCode })`
3. Build `Map<string, THoliday>` from response for O(1) date lookup
4. For each day cell, check if date is a holiday:
   - **Background:** `bg-red-50`
   - **Holiday name:** `localName` displayed below day number in `text-xs text-red-600 truncate`
5. Year change on month navigation triggers automatic refetch via RTK Query

### Fallback

- No country set on business → no holidays fetched, calendar renders as before

## Files

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/models/Holiday.ts` | `THoliday` type |
| Create | `src/store/holidays/holidaysApi.ts` | RTK Query endpoint |
| Modify | `Calendar.tsx` | Fetch + render holidays in day cells |
| Modify | `src/store/index.ts` | Register holidays API reducer |

## Verification

1. Select a business with `country: "UA"` → calendar should show Ukrainian holidays
2. Navigate months/years → holidays update correctly
3. Business without country → no holidays shown, no API call
4. Check RTK Query DevTools — holidays cached per year+country pair
