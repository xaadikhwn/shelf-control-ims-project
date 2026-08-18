# BizManage BMS — Business Management System

> **Full-stack, production-ready build** — BSc (Hons) Computer Science
> Student ID: 100536271 · Supervisor: Miss Eleanor Leist

## Overview

BizManage is an integrated Business Management System (BMS) for small-to-medium
enterprises (SMEs). It unifies core operations — Dashboard, Sales, Inventory, Payroll,
Expenses, Customers, and Suppliers — into a single responsive web application, with a
real Node.js/Express/MySQL backend behind it.

A key differentiator is the **customer/supplier credit ledger module**, modelling informal
credit ("khata") practices common in South Asian retail — tracking outstanding balances,
credit limits, utilisation percentages, partial payments, and overdue accounts, on both
the customer (receivables) and supplier (payables) side.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, React Router v6, Tailwind CSS, Chart.js, Axios, Vite |
| Backend | Node.js, Express, Sequelize v6, MySQL 8 (InnoDB) |
| Auth | JWT access token (in-memory) + httpOnly refresh cookie, bcrypt, RBAC |
| Testing | Jest + Supertest (backend) |

## Quick Start (local testing)

### 1. Database

You need a local MySQL 8 instance (or point at a hosted MySQL-compatible DB like TiDB Cloud —
see `backend/.env.example`).

```bash
mysql -u root -e "CREATE DATABASE bizmanage;"
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # edit if your MySQL user/password differ from the defaults
npm install
npm run db:migrate
npm run db:seed
npm start                  # runs on http://localhost:5000
```

On first boot the server also auto-seeds baseline roles/admin data if the tables are
empty (see `src/utils/autoSeed.js`) — so `npm run db:seed` is a convenience, not a
strict requirement.

**Seeded demo accounts** (password for all: `admin123` — change these before real use):

| Email | Role |
|---|---|
| admin@bizmanage.com | Administrator |
| manager@bizmanage.com | Manager |
| user@bizmanage.com | User |

### 3. Frontend

```bash
cp .env.example .env       # defaults to http://localhost:5000/api, matches the backend above
npm install
npm run dev                # runs on http://localhost:5173
```

### 4. Run the backend test suite

```bash
cd backend
npm test
```

Tests run against an isolated `<your db name>_test` database — see the "Fixes Applied"
section below for why this isolation matters and is enforced defensively.

## Project Structure

```
src/                     # React frontend
  components/            # layout/, ui/, charts/
  pages/                 # one folder per module (Dashboard, Sales, Inventory, ...)
  services/              # api.ts (real backend calls), authApi.ts, apiClient.ts, tokenStore.ts
  context/               # AuthContext, UIContext
  types/                 # shared TS interfaces

backend/
  src/
    config/              # Sequelize config (dev/test/production)
    models/               # Sequelize models
    migrations/           # versioned schema migrations
    seeders/               # sequelize-cli seeders (roles, admin user, demo data)
    utils/autoSeed.js      # startup auto-seed helper (NOT a sequelize-cli seeder)
    controllers/           # one per module
    routes/                 # one per module
    middleware/             # authenticate, requireRole, error handling
  tests/                    # Jest + Supertest suite
```

## Modules

| Route | Module | Notes |
|-------|--------|----------|
| `/` | Dashboard | Live KPIs, revenue/expense chart, sales-by-category, recent orders |
| `/sales` | Sales | Create orders (decrements stock, updates customer ledger atomically) |
| `/inventory` | Inventory | Stock levels, reorder points, low-stock/out-of-stock status |
| `/payroll` | Payroll | Employees, payroll runs — **Administrator/Manager only** |
| `/expenses` | Expenses | Claims with submit → approve/reject workflow (role-gated) |
| `/customers` | Customers | Credit ledger, partial/full payment recording, order history |
| `/suppliers` | Suppliers | Purchase ledger — record purchases (invoices) and payments |
| `/settings` | Settings | Profile, company info, preferences |

## Security Notes

- Access tokens live in memory only (never localStorage) — mitigates XSS token theft.
- Refresh tokens are httpOnly cookies, hashed (SHA-256) before being stored in the DB.
- Passwords are hashed with bcrypt (12 rounds).
- Login returns a generic "Invalid email or password" on any failure — no account
  enumeration.
- No email provider is configured. `forgot-password` works end-to-end, but in
  non-production environments the reset link is returned directly in the API response
  (and logged server-side) instead of emailed — wire up a real provider (Resend, SendGrid,
  etc.) before taking this to real users.
- **`.env` files are gitignored going forward** — see "Fixes Applied" below; rotate any
  credentials that were previously committed.

## Fixes Applied During Hardening

This build went through a live audit against a real MySQL instance before delivery.
Worth knowing about for anyone continuing this project:

- **Fixed**: login previously leaked all registered emails + a default password in its
  error message on failed login. Now returns a generic error with no enumeration.
- **Fixed**: refresh tokens were stored as raw JWTs in the database; now hashed (SHA-256).
- **Fixed**: forgot/reset-password were non-functional stubs; now a real, expiring,
  single-use token flow.
- **Fixed**: sale creation failed on every attempt due to a MySQL ENUM mismatch
  (`order_status` was missing `'completed'`, which the app inserts on every sale) —
  see migration `20260731000001-fix-order-status-enum.js`.
- **Fixed**: "most recent ledger entry" lookups ordered by `created_at` (second
  precision), which is non-deterministic when two entries land in the same second.
  Now ordered by `id`.
- **Fixed**: the supplier "payable" balance was entirely fabricated
  (`5000 + id * 1250`, not derived from any real data). It's now computed from a real
  ledger, with payment and purchase-recording endpoints and UI added (there was none
  before).
- **Fixed — important for anyone running tests**: the test suite drops and recreates
  every table it touches (`sequelize.sync({force:true})`), but the test database
  config previously fell through to whatever `DB_NAME` was set to in `.env` — meaning
  `npm test` could silently wipe your development (or production) database. The test
  config now always derives an isolated `<name>_test` database regardless of `.env`,
  and `tests/setup.js` has a hard runtime guard that refuses to run if the resolved
  database doesn't look like a test database.
- **Fixed**: `.env` (with live database credentials) had no `.gitignore` entry and was
  committed to git history. Added proper `.gitignore` rules — **the previously exposed
  credentials should still be rotated**, since removing a file from a future commit does
  not remove it from git history.

## Known Limitations / Suggested Next Steps

- No automated frontend tests yet (backend has Jest/Supertest coverage: 19/19 passing).
- No email provider wired up (see Security Notes above).
- Purchase-order line-item detail (individual products per purchase) isn't built — supplier
  purchases are currently recorded as a single amount + reference, not itemised.
- Consider adding rate limiting specifically on the password-reset endpoints in addition to
  login (currently only login/register are tightened).

---

*BizManage BMS · BSc (Hons) Computer Science · Student ID: 100536271 · Supervisor: Miss Eleanor Leist*
