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
