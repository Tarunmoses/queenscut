# Database command log

Running log of every command/script executed against Postgres for this project. Newest entries at the bottom. Local dev only — this log is not a substitute for the TypeORM migration history (`backend/src/database/migrations/`), which remains the source of truth for schema changes.

Local dev connection: `postgresql://queenscut_dev:queenscut_dev_local@localhost:5432/queenscut_dev` (see `backend/.env`, gitignored).

---

## 2026-10-02 — Local Postgres dev environment setup

**Context:** switched from Supabase to a local PostgreSQL 17 install for development (installed at `C:\Program Files\PostgreSQL\17`, data dir `D:\database_data\postgres_data_directory`, port 5432, auth `scram-sha-256`).

1. **Started the Windows service** (run by user, elevated PowerShell):
   ```powershell
   net start postgresql-x64-17
   ```

2. **Created a dedicated dev role + database** (run by user, elevated PowerShell, as the `postgres` superuser) — script: [`backend/db/setup/001_create_dev_db_and_role.sql`](./setup/001_create_dev_db_and_role.sql):
   ```powershell
   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -h localhost -p 5432 -f "D:\github_projects\queenscut\backend\db\setup\001_create_dev_db_and_role.sql"
   ```
   ```sql
   CREATE ROLE queenscut_dev WITH LOGIN PASSWORD 'queenscut_dev_local' CREATEDB;
   CREATE DATABASE queenscut_dev OWNER queenscut_dev;
   ```
   Rationale: the app connects as a dedicated low-privilege role rather than the `postgres` superuser.

3. **Verified connectivity** (run by Claude):
   ```bash
   psql -U queenscut_dev -h localhost -p 5432 -d queenscut_dev -c "SELECT current_user, current_database();"
   ```
   Result: `queenscut_dev | queenscut_dev` — OK.

4. **Wrote `backend/.env`** (gitignored) pointing at the local DB:
   ```
   DATABASE_URL=postgresql://queenscut_dev:queenscut_dev_local@localhost:5432/queenscut_dev
   DATABASE_SSL=false
   ```

5. **Ran the initial schema migration** (run by Claude):
   ```bash
   npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts
   ```
   Applied: `InitSchema1735804800000` (see `backend/src/database/migrations/1735804800000-InitSchema.ts`).
   Created: `pgcrypto` extension; enums `orders_status_enum`, `orders_payment_status_enum`, `inventory_items_status_enum`; tables `customers`, `orders`, `order_items`, `inventory_items`, `expenses`, `expense_orders` (+ their indexes/FKs); TypeORM's own `migrations` tracking table.
   Note: TypeORM's Postgres driver also auto-ran `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` on connect (its own internal init step, not part of our migration).

6. **Verified tables** (run by Claude):
   ```bash
   psql -U queenscut_dev -h localhost -p 5432 -d queenscut_dev -c "\dt"
   ```
   Result: 7 tables present (6 app tables + `migrations`) — OK.

7. **Found & fixed a bug**: `app.module.ts` hardcoded `ssl: { rejectUnauthorized: false }` for the TypeORM connection regardless of `DATABASE_SSL`, so the app failed to boot against local Postgres (`Error: The server does not support SSL connections`) even though `data-source.ts` (used by the migration CLI) already read `DATABASE_SSL` correctly. Added `databaseSsl` to `config/configuration.ts` and made `app.module.ts` branch on it the same way.

8. **Smoke-tested the running app** against the local DB (run by Claude, `node dist/main.js`):
   - `GET /health` → `{"status":"ok", ...}`
   - `POST /customers` → created a test customer
   - `POST /orders` with one nested item → confirmed `totalAmount`/`balanceDue`/`paymentStatus` are derived correctly (`2500.00` / `1500.00` / `partially_paid` for a ₹2500 item with ₹1000 advance)
   - Cleaned up: `TRUNCATE order_items, orders, customers RESTART IDENTITY CASCADE;`
   - Stopped the test server process.
