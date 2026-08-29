# Railway.app Deployment Guide

## ✅ What I Fixed

Your Railway build failures were due to:
1. **Missing root `npm start` script** - Fixed by adding start script to root package.json
2. **Backend app not serving frontend** - Fixed by adding static file serving and SPA fallback
3. **No Dockerfile** - Created proper Dockerfile for Railway's container build

---

## 🚀 Deploy to Railway (Updated)

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Fix Railway deployment configuration"
git push origin main
```

### Step 2: Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your repository
4. Railway will auto-detect the Dockerfile and build

### Step 3: Create a Supabase Database
1. Go to [Supabase](https://supabase.com) → **New Project**
2. Once it's provisioned, go to **Project Settings → Database → Connection string → URI**
3. Copy the **pooler** connection string (port `6543`) — it looks like:
   `postgresql://postgres.xxxxxxxxxxxx:your-password@aws-0-<region>.pooler.supabase.com:6543/postgres`

### Step 4: Set Environment Variables
Go to Railway's **Variables** tab and add:

```
NODE_ENV=production
PORT=8080
HOST=0.0.0.0

# Supabase (Postgres) — dialect is auto-detected from the postgres:// prefix
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxx:your-password@aws-0-<region>.pooler.supabase.com:6543/postgres
DB_SSL=true

# JWT Secrets (generate random strings)
JWT_ACCESS_SECRET=your_64_char_random_string_here
JWT_REFRESH_SECRET=your_64_char_random_string_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=${{RAILWAY_STATIC_URL}},https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Stock Alert
STOCK_ALERT_CRON=*/15 * * * *
```

### Step 5: Deploy
1. Railway will automatically build and deploy on every push
2. Check **Deployments** tab for logs
3. Your app will be available at the provided Railway URL

---

## 🔍 How It Works Now

```
Railway Deploy
    ↓
Dockerfile builds:
    ├─ Install root & backend dependencies
    ├─ Build frontend (React → dist/)
    └─ Start backend server
    ↓
Backend serves:
    ├─ Static files from /dist (frontend)
    ├─ /api/* endpoints (backend)
    └─ SPA fallback to index.html
    ↓
Single unified application
```

---

## 📋 Deployment Checklist

- [x] Dockerfile created
- [x] railway.json configured
- [x] Root package.json has start script
- [x] Backend app.js serves frontend
- [x] Environment templates created
- [ ] Push to GitHub
- [ ] Create Railway project
- [ ] Create Supabase project and copy the pooler connection string
- [ ] Set environment variables
- [ ] Verify deployment in logs
- [ ] Test login at your Railway URL

---

## 🆘 If Build Still Fails

### Check these in Railway logs:

1. **"npm install failed"**
   - Make sure both `package.json` and `backend/package.json` are valid JSON
   - Check for syntax errors

2. **"Cannot find module 'path'"**
   - This is built-in to Node.js, should work automatically
   - Make sure backend/src/app.js has `const path = require('path');` at top

3. **"Cannot find dist/index.html"**
   - Frontend build failed
   - Check build logs for errors in vite/TypeScript compilation

4. **Database connection error**
   - Verify `DATABASE_URL` is set to the Supabase pooler string and `DB_SSL=true`
   - Confirm the Supabase project isn't paused (free-tier projects pause after inactivity)

### Debug Locally
```bash
# Test the exact Docker build Railway uses:
docker build -t bizmanage .
docker run -p 8080:8080 -e DATABASE_URL=postgresql://user:pass@host:6543/postgres -e DB_SSL=true bizmanage
```

---

## 🎓 Project Structure for Railway

```
project-root/
├── Dockerfile                 ← Railway reads this
├── railway.json              ← Railway config
├── .railwayignore           ← Files to ignore
├── package.json             ← Root scripts
├── vite.config.ts          ← Frontend build
├── src/                    ← Frontend React code
├── dist/                   ← Built frontend (created by build)
└── backend/
    ├── package.json
    ├── src/
    │   ├── app.js          ← Serves dist/ + /api/*
    │   └── server.js
    └── .env.railway        ← Environment template
```

---

## 📞 Common Railway Variables

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase pooler connection string (from Project Settings → Database) |
| `DB_SSL` | Set to `true` for Supabase |
| `${{RAILWAY_STATIC_URL}}` | Your Railway app's public URL |

---

## ✨ Next Steps

1. **Push the fixed code** to GitHub
2. **Create Railway project** and connect GitHub
3. **Create a Supabase project** and copy its pooler connection string
4. **Set environment variables**
5. **Watch deployment logs** and verify it works
6. **Test login** with your seeded credentials

Your app will now deploy as a complete full-stack application!
