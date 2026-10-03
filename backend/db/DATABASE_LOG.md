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

---

## 2026-10-02 — Added `inventory_usage` table

**Context:** new feature — linking inventory consumption (material usage) to an order/sub-order from the expense-logging flow, decrementing stock automatically.

Migration applied (run by Claude):
```bash
npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts
```
Applied: `AddInventoryUsage1759435000000` (`backend/src/database/migrations/1759435000000-AddInventoryUsage.ts`). Created table `inventory_usage` (inventory_item_id/order_id/order_item_id FKs `ON DELETE RESTRICT`, expense_id FK `ON DELETE SET NULL` so deleting an expense keeps the consumption record as history) + 3 indexes.

Smoke-tested end to end (run by Claude, live app process): created a customer/order/inventory item, `POST /expenses` with a `usageLines` entry decremented stock (10→7), snapshotted unit/total cost, auto-linked the order to the expense, and `GET /inventory/usage` returned it with full relations. Verified the insufficient-stock guard rejects over-consumption (400). Verified explicit `orderIds` + `usageLines` on a *different* order both end up linked on the same expense (union, not override), and `GET /expenses` returns the `usageLines` relation on every row. Cleaned up each time with `TRUNCATE inventory_usage, expense_orders, expenses, order_items, orders, customers, inventory_items RESTART IDENTITY CASCADE;`, stopped the test server.

---

## 2026-10-02 — Bug found & fixed: orphaned expense on failed inventory usage; order-edit endpoint added

While testing the new per-order-item edit flow against the live (seeded) demo database, found that `POST /expenses` with a `usageLines` entry whose quantity exceeded stock left a **saved expense row with no matching usage/stock deduction** — `ExpensesService.create()` saved the expense unconditionally before processing usage lines, so a later failure didn't roll it back. This left 3 orphaned test expenses and one understated inventory quantity (Gold Thread) in the demo dataset, cleaned up manually (see below). **Fixed** by wrapping expense + all usage-line creation in one DB transaction (`expensesRepository.manager.transaction(...)`), with `InventoryService.recordUsage()` now accepting an optional `EntityManager` to participate in the caller's transaction; also switched usage-line processing from `Promise.all` to a sequential loop to avoid two lines for the same item racing on the same stock read-then-write. Verified: an insufficient-stock usage line now correctly results in zero new expense rows (confirmed via expense count before/after).

Also discovered (not yet fixed, documented in `docs/tracks/backend.md`): `DELETE /orders/:id` and `DELETE /customers/:id` throw an unhandled 500 (not a clean 4xx) once any order on that customer has `inventory_usage` history, because of the `ON DELETE RESTRICT` foreign keys — found while trying to clean up test data via the API and having to fall back to manual SQL instead.

**Manual cleanup performed** (run by Claude, via `psql` since the orphaned rows couldn't be removed through the API due to the RESTRICT FKs above): deleted 3 stray test expenses and their `inventory_usage`/`expense_orders` rows, restored Gold Thread (15→18) and Net Fabric (already restored in an earlier step) to their correct seeded quantities, recomputed `inventory_items.status` for all rows. Verified afterward against the running API: exactly 4 expenses (matching the original seed), 5 customers (no stray `TEMP*` rows), 5 orders, and every inventory quantity/status back to its seeded value.

Added `PATCH /orders/:id/items/:itemId` (new `OrdersService.updateItem()`) to edit a single order item (measurements/apparelType/designNotes/amountCharged) in place without the delete-and-recreate the existing `update()` already used for its `dto.items` path — that path is incompatible with `inventory_usage`'s RESTRICT FKs (would fail to delete an item that has usage history) and is unused by the mobile app, so left as-is but flagged. Smoke-tested the new endpoint on a disposable order (not the demo data): measurements + amount updated, parent order's `totalAmount`/`balanceDue` recomputed correctly.

---

## 2026-10-02 — Demo seed data

**Context:** user wants to demo the mobile app to a family member; database was empty.

Added `backend/db/seed/seed.js` (plain Node script, calls the real running API via `fetch` rather than inserting rows directly, so every computed field — order totals, payment status, stock status — goes through the actual validated service logic). Added `npm run seed` script in `backend/package.json`.

Ran it (run by Claude) against the local dev DB (was empty at the time — verified via `SELECT count(*)` on all 4 tables first): 5 customers, 6 inventory items (deliberately spanning all 3 stock statuses: Chalk at 0 → critical, Red Thread at 2 ≤ reorder 3 → low, rest → ok), 5 orders spanning pending/in_progress/complete and unpaid/partially_paid/paid (one, Anjali Mehta's, deliberately due today), 4 expenses (1 plain, 2 with `usageLines` that decremented Gold Thread and Lining Material stock, 1 labor expense linked via `orderIds`). Verified all computed fields via `GET /orders`, `GET /inventory`, `GET /expenses` afterward — all correct.

**Not idempotent** — re-running `npm run seed` adds a second copy of everything. To reset, truncate first: `TRUNCATE inventory_usage, expense_orders, expenses, order_items, orders, customers, inventory_items RESTART IDENTITY CASCADE;`

Backend left running (`node dist/main.js`) after seeding, for the demo.
