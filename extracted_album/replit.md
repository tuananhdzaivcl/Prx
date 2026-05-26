# Kỷ Niệm Lớp 9A2

A class memorial website for class "9A2" themed "Tuổi Học Trò" (Student Years) — letting former classmates relive memories together with photos, stories, and shared nostalgia.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/lop9a2 run dev` — run the frontend (port 23147)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — Express session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui, wouter routing
- API: Express 5 + express-session + multer (file upload)
- DB: PostgreSQL + Drizzle ORM (tables: members, photos)
- Auth: Session-based (bcrypt passwords)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — DB schema (members.ts, photos.ts)
- `artifacts/api-server/src/routes/` — backend routes (auth, photos, stats, admin)
- `artifacts/api-server/uploads/` — uploaded photo files (served at /api/uploads/)
- `artifacts/lop9a2/src/` — React frontend

## Architecture decisions

- Session-based auth via express-session (not JWT) — simpler for this use case
- Photos stored on disk in `artifacts/api-server/uploads/` and served statically
- Admin account seeded directly via SQL insert (username: admin9a2)
- No approval flow for photos — all uploaded photos appear immediately
- Blocked users are logged out and cannot upload or log in again

## Product

- **Trang chủ**: Hero with emotional intro paragraph, gallery stats, recent photos with float animations
- **Thư viện ảnh**: Full photo grid, upload button when logged in, staggered entrance animations
- **Đăng ký/Đăng nhập**: Auth forms for class members
- **Trang quản trị (/admin)**: Admin-only dashboard — member management (block/unblock) + photo deletion

## Default Admin Account

- **Username**: `admin9a2`
- **Password**: `AdminPassword123`

## User preferences

- All UI text in Vietnamese
- Warm amber/honey-gold color theme
- No emojis in the UI

## Gotchas

- Always run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` — the api-server depends on compiled lib declarations
- Photo uploads use multipart/form-data; the generated hook uses JSON so the frontend uses raw fetch for uploads
- `SESSION_SECRET` env var must be set for the API server to start

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
