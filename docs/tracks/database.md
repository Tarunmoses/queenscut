# Database track

## Status

Local PostgreSQL 17 running on the Windows PC for development. Initial schema migration applied (6 tables). Supabase is the intended production/shared database but hasn't been provisioned yet.

## Context

- **Why local Postgres instead of Supabase right now:** faster iteration while the schema is still changing; no network dependency. See `backend/.env.example` for both connection shapes (local and Supabase) — only `DATABASE_URL`/`DATABASE_SSL` differ, no code changes needed to switch.
- **Detailed command log:** every command/script actually run against Postgres (service start, role/db creation, migrations, smoke-test truncates) is logged in [`backend/db/DATABASE_LOG.md`](../../backend/db/DATABASE_LOG.md) — append there for anything DB-command-level; this file is the higher-level status/context instead.
- **Local install details:** PostgreSQL 17 at `C:\Program Files\PostgreSQL\17`, data dir `D:\database_data\postgres_data_directory`, port 5432, Windows service `postgresql-x64-17`, auth `scram-sha-256` (password required even for localhost). App connects as a dedicated `queenscut_dev` role (not the `postgres` superuser) — see `backend/db/setup/001_create_dev_db_and_role.sql`.
- **⚠️ Cross-device gotcha:** this is **local** Postgres — the actual data (customers/orders/etc. you create while testing) lives only on this Windows PC's disk. Git syncs the *code* (entities, migrations) to the MacBook, but not the *data*. On a fresh device you either (a) install Postgres there too and run migrations to get an empty schema, or (b) move to a shared Supabase instance so both devices hit the same data. Don't assume test data "is just there" on the other machine.
- **Windows service needs admin rights to start/stop**, which Claude's shell doesn't have on this PC — if it's ever stopped, ask the user to run `net start postgresql-x64-17` in an elevated terminal (or the macOS equivalent `brew services start postgresql` if that's where Postgres ends up running instead on the Mac).
- **Demo seed data:** `backend/db/seed/seed.js` populates realistic demo data (5 customers, 6 inventory items spanning all 3 stock statuses, 5 orders spanning every order/payment status combo with one due today, 4 expenses including inventory-usage-linked ones) by calling the real running API with `fetch` rather than inserting rows directly — so computed fields (totals, payment status, stock status) are correct, not faked. Run `npm run seed` from `backend/` with the server already running. **Not idempotent** — re-running adds duplicates; truncate first if you want a clean reset (command in `DATABASE_LOG.md`).

## Next steps

1. **Provision Supabase** once the schema has settled down a bit more — this is what actually solves cross-device continuity for data, not just code. Low effort: create the project, copy `DATABASE_URL`, run `migration:run` once against it.
2. Until then, if developing from the MacBook: install Postgres locally there (e.g. via `brew install postgresql@17` or Postgres.app), create an equivalent dev role/db (same SQL script works), copy `backend/.env.example` → `backend/.env` with `DATABASE_SSL=false`, run migrations fresh.
3. ~~Decide on a seed-data script~~ — done: `backend/db/seed/seed.js` (`npm run seed` from `backend/`), see Context below. Re-run it (or extend it) whenever a fresh/reset database needs realistic demo data again — including on a new Supabase instance once that's provisioned.

## Worklog

**2026-10-02** — Local Postgres 17 dev environment set up: Windows service started, dedicated `queenscut_dev` role+db created, connectivity verified, `backend/.env` written, initial schema migration (`InitSchema1735804800000`) applied — 6 tables + indexes/FKs/enums confirmed via `\dt`. Full command-by-command detail in `backend/db/DATABASE_LOG.md`.
