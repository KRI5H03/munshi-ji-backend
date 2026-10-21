# Munshi Ji — Daily Log

Schema and rounding rules live in DECISIONS.md.

---

## Day 1 — Tue 20 Oct 2026

- Froze the schema at 12 tables. Multi-business confirmed: one login, 1–4 firms.
- Two real bills settled the open questions — the 4.762% discount is a
  GST-inclusive back-calculation, and the rounding rules now match both bills.
- Node 20 was EOL since April. Upgraded to 24.22.0 and reinstalled everything.
- Repo munshi-ji-backend created, private. First commit pushed.
- Postgres 16 running, munshiji database created.

**Next:** src/config/env.ts — Zod env loader, 4 keys, exit(1) on failure.

## Day 2 — Wed 21 Oct 2026

- env.ts — Zod env loader. Tested both paths: valid env passes silently,
  missing JWT_SECRET names the key and exits 1.
- app.ts / server.ts split. Server live on 4000, /health responding.
- db/connection.ts — postgres pool wrapped in Drizzle.
- Schema: enums.ts (8 enums), businesses, users, user_businesses, contacts.
  5 of 12 tables done.
- Lost ~40 min to VS Code using its bundled TypeScript instead of the
  workspace 5.9.3. Fix: status bar → Select TypeScript Version → Workspace.
- Pattern to watch: every mistake tonight was inside a quoted string —
  "contsct", "createed_at", table.userId twice. tsc never catches these.
  Habit: after each table, reread only the strings.
- Learned: named vs default imports; why money is integer paise (binary
  float error accumulates); why invoices snapshot contact details (history
  must not change when a contact is edited); why doc_counters needs a row
  lock (two saves in the same second both read the same serial); why
  account numbers are text (leading zeros, 18 digits, no arithmetic);
  why email format belongs in Zod but uniqueness belongs in the DB.

**Next:** src/db/schema/items.ts — stock_qty needs CHECK >= 0.
