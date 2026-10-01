# Backend track

## Status

Core REST API is running against local Postgres: CRUD for customers, orders (with nested items), inventory, and expenses. No auth yet. Not deployed anywhere — runs locally only (`npm run dev:backend`).

## Context

- **Stack:** NestJS + TypeORM + `pg`, `class-validator` DTOs, `@nestjs/config` for env. Module-per-domain under `backend/src/modules/`.
- **Derived fields, not stored redundantly:** `Order.totalAmount`/`balanceDue`/`paymentStatus` are computed server-side in `OrdersService` from the order's items + advance — never trust a client-supplied value for these except as an override. `CustomersService.getSummary()` computes totalSpent/paid/pendingBalance from the customer's orders on read, not as stored columns, so they can't drift out of sync with order edits.
- **SSL config:** `app.module.ts` and `src/database/data-source.ts` (used by the TypeORM CLI) both read `DATABASE_SSL` from env independently — they drifted out of sync once already (see 2026-10-02 entry below). If you touch DB connection config, check both.
- **Enums live in `@queenscut/shared`:** `OrderStatus`, `PaymentStatus`, `InventoryStatus` are defined once in `shared/src/types.ts` and imported into TypeORM entities — don't redefine them backend-side.
- **Known data-model gap vs. the locked mobile design:** `MobileViewOrder.dc.html` (the locked design) shows per-item completion status (✓ done / ⚠ attention) and a material-source distinction ("Supplied" vs "From inventory") on each order item — neither exists on `OrderItem` today. Mobile's `ViewOrderScreen` currently omits both. Adding them means a new migration (`OrderItem.itemStatus` enum + `OrderItem.materialSource` enum) plus DTO/service updates.
- **No auth/users table yet** — `MobileSignIn`/`MobileSignUp` mockups exist in the design but there's nothing backend-side for them (no `User` entity, no guards, no JWT). Every endpoint is currently open.

## Next steps

1. Decide on and implement `OrderItem.itemStatus` + `materialSource` (closes the ViewOrder gap above).
2. Add a `User` entity + auth (JWT or session) once the sign-in/sign-up screens are built — currently nothing protects the API.
3. Inventory stock-movement history (mobile's Inventory "History" tab currently has no data to show — would need an `inventory_transactions` table).
4. When ready to share data across devices (see [database track](./database.md)), swap `DATABASE_URL`/`DATABASE_SSL` to Supabase — no code changes needed, just env + rerunning migrations there.

## Worklog

**2026-10-02** — Initial scaffold: NestJS app, 4 modules (customers/orders/inventory/expenses), hand-written initial migration, `.env.example` for Supabase. Verified `npm install` + `nest build` pass.

**2026-10-02** — Switched dev DB from Supabase to local Postgres (see [database track](./database.md) for the DB-side steps). Found and fixed a bug: `app.module.ts` hardcoded `ssl: { rejectUnauthorized: false }` regardless of `DATABASE_SSL`, so the app failed to boot locally (`Error: The server does not support SSL connections`) even though the migration CLI's `data-source.ts` already read the env var correctly. Added `databaseSsl` to `config/configuration.ts`, made `app.module.ts` branch on it the same way. Smoke-tested `/health`, `POST /customers`, `POST /orders` (nested items, computed totals) end to end against the real app process, then truncated test rows.

**2026-10-02** — Verified `PATCH /orders/:id` for `status`/`paymentStatus` updates while building the mobile `ViewOrderScreen`. Works as expected; no backend changes needed for that screen.
