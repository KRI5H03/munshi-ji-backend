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

## Day 3 — Thu 22 Oct 2026

- items.ts — CHECK stock >= 0, unique design_no per business (case-insensitive).
- doc_counters.ts — unique on (business, doc_type, fy); CHECK blocks purchase.
- invoices.ts — imports only.
- Ekadashi fast + 8 lectures. Stopped early. Fri off, Sat morning recovery.
- 7 of 12 tables.

**Next:** invoices.ts columns, group by group.

## Day 4 — Sat 24 Oct 2026 (ran to 1:30am)

- All 12 tables written: invoices, invoice_lines, invoice_tax_summary,
  stock_movements, ledger_entries, audit_logs, plus schema/index.ts.
- drizzle.config.ts + first migration. 12 tables live in Postgres.
- Bugs caught before migration: serial_rule required a serial on
  purchases (would have rejected every purchase bill); payment_mode
  check was inverted (would have rejected every sale's ledger entry);
  invoiceId notNull on ledger and stock (would have blocked payments
  and opening stock). tsc saw none of them.
- Raw SQL in checks caused 3 bugs across 2 files. Use ${table.x}.
- Learned: why tax summary is stored (it's what was charged and filed);
  composite index column order; polymorphic audit reference.

**Next:** src/core/money.ts + tests. Then gst.ts against both real bills.

## Day 5 — Sun 25 Oct 2026

- src/core/money.ts — 5 functions: rupeesToPaise, formatPaise,
  applyPercentMilli, applyBasisPoints, roundToRupee, plus private
  divideRoundHalf (quotient + remainder, no floats ever).
- tests/unit/money.test.ts — 27 tests, all passing. Every expected
  value comes from a real bill or a hand calculation.
- Rounding now matches father's software exactly on all three bills
  (test bill, BHOLA COLLECTION, BHOLA SALES).
- Tests caught 2 missing guards, then 4 more bugs I introduced
  while fixing them.
- My recurring mistake: guard conditions written backwards (good case
  where the bad case belongs, && vs ||). Fix: inside if (!( ... )) always
  describe the GOOD value; try one good and one bad value before saving.
- Copy-paste between similar functions caused bp <= 100000.
  Now going one function at a time, explained in words first.
- Learned: regex basics, padStart vs padEnd, toBe vs toEqual,
  why toThrow needs () =>, De Morgan's law, half-up vs banker's rounding.

**Next:** src/core/fy.ts — getFinancialYear. Spec is in chat.

## Day 6 — Mon 26 Oct 2026

- src/core/fy.ts — getFinancialYear. 1 Apr / 31 Mar boundaries tested.
  Parses the date string; no JS Date (timezone risk).
- src/config/gstRules.ts — rate chart with effective dates.
  5% ≤ ₹2,500 / 18% above from 22 Sep 2025; old 1,000/12% row kept.
- src/core/gst.ts — getGstRateBp. Picks the row covering the bill date.
- 43 tests passing.
- DECIDED: discounted value picks the GST rate AND is what gets taxed.
  Closes open question #2. Still confirm with CA before launch.
- Note for invoice service: per-piece value = line taxable ÷ qty must
  round UP, or ₹2,500.0011 wrongly becomes 5%.

**Next:** src/core/discount.ts — discount apportionment.

## Day 7 — Sun 1 Nov 2026 (after midnight)

- apportionDiscount done (round 2 + guards written with AI help —
  re-read and explain it in my own words this week).
- Largest remainder method: whole shares first, leftover paise to
  the biggest remainders, ties to the earlier line.
- 55 tests passing.

**Next:** src/core/tax.ts — group lines by HSN + rate, compute CGST/SGST/IGST.

## Day 8 — Mon 2 Nov 2026 (ran to midnight)

- src/core/tax.ts — computeTaxSummary. Groups lines by HSN + rate
  using a Map (group-and-sum pattern), taxes once per group.
  Same state → CGST + SGST at half rate each; other state → IGST.
- Learned Map from scratch: has / get / set, string keys like
  "62114290|500" (object keys compare by reference, strings by value).
- IGST can be 1 paisa more than CGST + SGST — rounding once vs twice.
  Expected, not a bug.
- Caught myself reading placeholder output as a pass. Check the
  numbers are mine, not the dummy ones.
- 63 tests passing. Core bill maths complete.

**Next:** two small core helpers — formatInvoiceNo, then amountInWords.
After that, core/ is done and we start auth.

## Day 9 — Tue 3 Nov 2026

- core/invoiceNumber.ts — formatInvoiceNo. serial must be a number:
  as a string, "023" passed the guard but printed "023/2026-27".
- core/amountInWords.ts — twoDigitWords helper, then amountInWords.
  Indian grouping: crore / lakh / thousand / hundred / rest.
  Build a list of non-empty parts and join once — no stray spaces.
- Bugs caught: trailing space on "Twenty "; guard allowed 100;
  / and % swapped on the thousand line; "Lakhs"; raw "50 Paise".
- Read the stack trace line number instead of guessing the line.
- 86 tests passing. core/ COMPLETE — every number and word on the
  bill comes from tested code.

**Next:** auth — users + user_businesses, register / login with
bcrypt + JWT, then tenant middleware.
