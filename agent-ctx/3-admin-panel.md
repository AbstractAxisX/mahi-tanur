# Task 3 — Admin Panel (پنل مدیریت) for ماهی‌یار

## What was built

### 1. `src/app/api/upload/route.ts` (NEW)
Image upload endpoint:
- `POST` with FormData field `file` (png/jpg/jpeg/webp/gif, max 8MB)
- Validates mime (`ALLOWED_MIME` map) + size → 400 with Persian error on invalid
- Saves to `public/uploads/<randomUUID-hex>.<ext>` via `node:fs/promises` (mkdir recursive)
- Responds `{ url: "/uploads/<filename>" }` with 201

### 2. `src/components/mahi/views/AdminView.tsx` (replaced stub, default export, "use client")
Full admin panel, TS-strict, no `any`, Persian RTL, on-brand (my-card, #ec407a/#00acc1/#4a154b, Vazirmatn, Persian numerals via toFaDigits/faPrice):

- **Tabs** (horizontally scrollable chips): تنظیمات سایت | دسته‌بندی‌ها | ماهی‌ها | حَشوها | زمان‌ها | روش دریافت | سفارش‌ها
- **Generic CRUD engine**: `FieldDef` schema (text/textarea/number/image/select/switch) drives create/edit Dialog per entity; required-field validation; unique-code client check for delivery methods
- **ImageField (KEY feature)**: URL text input + «آپلود عکس» file button (POST /api/upload → sets returned url, spinner, toasts) + live preview thumbnail (next/image unoptimized) + حذف button. Used for fish/extras/categories images + settings heroImage
- **Entity cards**: image-or-icon leading visual, name/title, price (faPrice + تومان), ترتیب, active pill; Switch → immediate `PATCH {active}`; pencil → edit dialog; trash → AlertDialog confirm → DELETE
- **Fish tab**: dynamic category Select (fresh categories fetched), price, badgeText, description
- **TimeSlot tab**: label, shift select (ظهر/عصر), icon select (sun/moon)
- **Delivery tab**: code (uniqueness checked), title, subtitle, price (0 → «رایگان»), icon select (home/truck/scooter)
- **Settings tab**: 5 grouped cards with all 14 SiteSettings fields + hero image upload → PATCH /api/admin/settings/1
- **Orders tab**: rich cards (thumb, fishName×qty, receiver/phone, slot/method, address, extras chips, note, total, date) + StatusBadge + 3-segment status buttons → PATCH /api/orders/<id> {status} + delete
- Loading skeletons + empty states + count badges per tab; refetch after every mutation + `mahi:refresh` event so customer app live-updates; toasts on all outcomes

## Contract honored (no API changes)
- GET/POST `/api/admin/[model]`, PATCH/DELETE `/api/admin/[model]/[id]`, PATCH/DELETE `/api/orders/[id]` — used exactly as-is. POST bodies sent with exact prisma field names/types.

## Verification
- `bun run lint`: **0 problems in my 2 files** (2 pre-existing errors in AddressFormView/SettingsView from Task 2, untouched)
- `tsc --noEmit`: 0 errors in my files
- Upload e2e: png → 201 + URL serves 200; webp → 201; bad mime → 400; empty form → 400
- Admin API e2e: POST/PATCH/DELETE category + order status PATCH all verified (data restored/cleaned after test)
- dev.log clean, `/` → 200

Full record also appended to `/home/z/my-project/worklog.md`.
