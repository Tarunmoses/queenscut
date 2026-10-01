# Web track

## Status

Not started. `web/` is only a placeholder `package.json` stub so `npm install` at the repo root doesn't fail on the workspace list.

## Context

- **Planned stack:** React + Vite, React Router, sidebar nav, same `@queenscut/shared` design tokens/types as mobile and backend.
- **Locked designs exist and are more extensive than mobile's** — 17 web artboards were found in the same design canvas artifact used for mobile (`https://claude.ai/code/artifact/b9ef64b8-d502-42d8-b80a-f589edc2f266`): `WebDashboard`, `WebOrdersList`, `WebOrderDetail`, `WebCreateOrder`, `WebInventory`, `WebAddStock`, `WebInventoryUsage`, `WebCustomers`, `WebCustomersDetail`, `WebExpenses`, `WebAddExpense`, `WebRevenueReport`, `WebExpenseReport`, `WebSettings`, `WebCustomerReport`, `WebInventoryReport`, `WebEditSuborder`. None have been read in detail yet.
- **Lesson carried over from the mobile track** (see [mobile.md](./mobile.md) Context): don't eyeball the design from the 5 brand colors or extrapolate from mobile's layout — extract and read each `.dc.html` artboard directly from the canvas artifact before building, the same way mobile's rebuild did. The mobile rebuild found real inconsistencies and non-obvious patterns (the 3-tier status badge scale, specific measurement fields) that would have been missed by guessing.
- **Customers isn't a dedicated mobile feature but has 2 dedicated web screens** (`WebCustomers`, `WebCustomersDetail`) — the backend's `CustomersService.getSummary()` (totalSpent/paid/pendingBalance computed from orders) was built with this in mind.

## Next steps

1. Read the 17 web artboards (same extraction method as mobile.md's Context section) before scaffolding anything, to avoid the same false-start the mobile track had.
2. Scaffold Vite + React + TypeScript, wire `@queenscut/shared`, set up React Router with a sidebar shell matching `WebDashboard`'s layout.
3. Build screens in roughly the order the backend already supports fully: Dashboard → Orders (list/detail/create) → Inventory → Expenses → Customers → Reports/Settings last.

## Worklog

_Nothing yet._
