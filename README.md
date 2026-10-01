# QueensCut

Boutique management app monorepo — backend (NestJS + TypeORM + Supabase), web (React + Vite), mobile (React Native + Expo), and shared design tokens/types.

Design source of truth lives in the companion [`queenscut-ai-artifacts`](https://github.com/Tarunmoses/queenscut-ai-artifacts) repo (locked screens, review pages).

**Picking this up on a different machine? Start with [`docs/tracks/`](./docs/tracks/README.md)** — status, context, and next steps for each of the 4 tracks (backend, web, mobile, database), kept up to date as work happens.

## Structure

- `backend/` — NestJS API, TypeORM entities, Postgres migrations (local dev now, Supabase planned — see [`docs/tracks/database.md`](./docs/tracks/database.md))
- `web/` — React + Vite desktop app (not yet scaffolded — see [`docs/tracks/web.md`](./docs/tracks/web.md))
- `mobile/` — React Native + Expo app (see [`docs/tracks/mobile.md`](./docs/tracks/mobile.md))
- `shared/` — design tokens (colors, typography, spacing) and shared TypeScript types, consumed by all three apps

## Getting started

```bash
npm install
npm run build:shared

cp backend/.env.example backend/.env   # fill in your Supabase DATABASE_URL
npm run build:backend --workspace backend
npm run migration:run --workspace backend
npm run dev:backend
```
