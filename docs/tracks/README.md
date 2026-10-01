# Track worklogs

Status, context, and next steps for each of the 4 development tracks, kept up to date as work happens so a session on a different machine (Windows PC or MacBook) can pick up with full context.

- [Backend](./backend.md) — NestJS API, TypeORM
- [Web](./web.md) — React + Vite
- [Mobile](./mobile.md) — React Native + Expo
- [Database](./database.md) — Postgres (local dev now, Supabase planned)

## Convention

Each file has the same 4 sections:

- **Status** — one line, current state
- **Context** — decisions and why, things that aren't obvious from the code
- **Next steps** — prioritized, kept short; move items here out of worklog entries once they're no longer "just happened"
- **Worklog** — dated entries, newest at the bottom (matches [`backend/db/DATABASE_LOG.md`](../../backend/db/DATABASE_LOG.md)'s convention)

Update the relevant file(s) whenever a track's status changes meaningfully — not after every single file edit, but after a unit of work (a feature built, a bug found and fixed, a design decision made). Commit alongside the code change it documents so git history stays the source of truth for *when*.
