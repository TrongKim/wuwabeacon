# Setup Guide

## 1. Cài Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/postcss postcss --save-dev
```

## 2. Cấu hình Supabase

Mở file `src/environments/environment.ts` và `src/environments/environment.prod.ts`, thay:

```ts
supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
supabaseKey: 'YOUR_ANON_KEY',
```

Bằng URL và key thực tế từ Supabase dashboard của bạn.

## 3. Chạy dev server

```bash
ng serve
```

## 4. Build production

```bash
ng build
```

## 5. Chạy SSR server

```bash
node dist/wuwabeacon/server/server.mjs
```

## Cấu trúc modules

```
src/app/
  modules/
    home/          → Trang chủ (guides list + filter)
    resonators/    → Characters list + detail
    weapons/       → Weapons list + detail
    echoes/        → Echos list + detail
    guide/         → Guide detail page
    contribute/    → Tribute page
  shared/
    components/    → Sidebar, Footer
    services/      → SupabaseService
    interfaces/    → TypeScript interfaces
    enums/         → Enums
    utils/         → Text utils
    data/          → Mock/static data
```
