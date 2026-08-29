# Vercel Deployment Guide

This app deploys to Vercel as a single project: the React frontend is served as
static output, and the Express/Sequelize backend runs as Vercel Serverless
Functions under `/api`.

## How it's wired

- `api/index.js` and `api/[...slug].js` both `export default` the same Express
  app (`backend/src/app.js`). Vercel's filesystem routing sends `/api` to
  `index.js` and everything else under `/api/*` to `[...slug].js` — no rewrite
  rule is needed for this, filesystem matches (static files and functions)
  always take precedence over `vercel.json` rewrites.
- `vercel.json` builds the frontend (`npm run build` → `dist/`) and rewrites
  every non-matched path to `/index.html` for client-side routing.
- `installCommand` runs `npm install` at the root **and** inside `backend/`,
  since this is two separate `package.json`/`node_modules` trees and Vercel
  only installs the root by default.

## Two things behave differently here than on a long-running server (e.g. Railway)

1. **No boot-time migrations/seeding.** `backend/src/server.js` (which calls
   `sequelize.sync()` and `autoSeed()` on startup) is never invoked — Vercel
   functions import `app.js` directly, there's no persistent process to run
   startup code. Run migrations yourself, once, against the Supabase database
   before/after each schema change:
   ```bash
   cd backend
   DATABASE_URL="postgresql://...supabase pooler url..." DB_SSL=true npx sequelize-cli db:migrate
   ```

2. **No in-memory cron.** `startStockAlertCron()` (node-cron) also never runs
   for the same reason. Instead, `GET /api/cron/stock-alert` runs one check
   and is wired to Vercel Cron in `vercel.json` (`0 6 * * *`, daily at 06:00
   UTC). **Vercel's Hobby (free) plan caps cron jobs at once per day** — if
   you need the original 15-minute cadence, either upgrade to Pro (per-minute
   cron) or point a free external pinger (e.g. cron-job.org) at
   `/api/cron/stock-alert` on your preferred schedule. Either way, set a
   `CRON_SECRET` env var in Vercel — the endpoint checks it against an
   `Authorization: Bearer <secret>` header (which Vercel Cron sends
   automatically when `CRON_SECRET` is set) or a `?secret=` query param.

## Environment variables (set in Vercel → Project → Settings → Environment Variables)

```
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:your-password@aws-0-<region>.pooler.supabase.com:6543/postgres
DB_SSL=true
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=https://your-project.vercel.app
CRON_SECRET=...
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
EMAIL_FROM=no-reply@bizmanage.com
EMAIL_PROVIDER_API_KEY=...
```

`NODE_ENV=production` is set automatically by Vercel — don't override it.

## Deploy steps

1. Push to GitHub, import the repo in Vercel (framework preset: **Other** —
   the explicit `buildCommand`/`outputDirectory` in `vercel.json` cover it).
2. Set the environment variables above.
3. Deploy.
4. Run migrations against Supabase once (see above) — the schema won't exist
   until you do.
5. Visit the deployed URL and confirm `/api/health` returns `{"success":true}`.
