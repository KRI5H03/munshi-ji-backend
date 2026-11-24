# Munshi Ji — Backend

Multi-tenant GST invoicing and inventory API for garment traders in India.

**Status:** v1 in progress, deployed.
**Live API:** [https://munshi-ji-backend.onrender.com]
**Frontend repo:** [https://github.com/KRI5H03/munshi-ji-frontend]

## Features

- Multi-tenant architecture: every record is scoped by `business_id`
- JWT authentication with bcrypt password hashing
- GST logic: CGST + SGST for same-state sales, IGST for inter-state
- GST rate by item price: 5% up to ₹2,500, 18% above
- Contacts (parties) and item/inventory management
- Sale bills with percentage-only discounts
- Audit trails and soft deletes

## Tech stack

- Node.js, TypeScript, Express 5
- PostgreSQL (Neon) with Drizzle ORM and the `postgres` driver
- JWT (jsonwebtoken) and bcrypt for authentication
- Zod for request validation
- Vitest for testing
- Deployed on Render

## Architecture

Routes → Controllers → Services → Drizzle (Postgres)

- Auth and tenant middleware resolve the user and `business_id` on every request
- All queries are filtered by `business_id`

## Getting started

```bash
git clone [repo-url]
cd [repo-folder]
npm install
cp .env.example .env
npm run dev
```

## Environment variables

| Variable       | Description                |
| -------------- | -------------------------- |
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET`   | Secret for signing tokens  |
| `PORT`         | Server port                |

## API overview

| Method   | Route                 | Description              |
| -------- | --------------------- | ------------------------ |
| POST     | `/auth/register`      | Create business and user |
| POST     | `/auth/login`         | Log in, receive JWT      |
| GET/POST | `/contacts`           | List / create parties    |
| GET/POST | `/items`              | List / create items      |
| POST     | `/sale-bills`         | Create a sale bill       |
| GET      | `/sale-bills/:id/pdf` | Download bill PDF        |

(Replace with your real routes.)

## Roadmap

- Purchase bills
- Party ledger
- Monthly/quarterly GST summary
- Debit/credit notes
- Packing/shipping charges on bills
- Busy export import
- Balance sheet, subscriptions

## Author

Krish Ramani — [GitHub](https://github.com/KRI5H03) · [X](https://x.com/krishramani03)
