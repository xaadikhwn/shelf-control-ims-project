# BizManage - Deployment Guide

## Prerequisites
- GitHub account with your repo pushed
- Render.com account (free tier available)
- MySQL database (Render provides free tier MySQL)

---

## Option 1: Deploy to Render.com (Recommended)

### Step 1: Set Up MySQL Database on Render

1. Go to [Render.com](https://render.com) and sign in
2. Click **"New"** → **"MySQL"**
3. Choose settings:
   - **Name**: `bizmanage-mysql`
   - **Database Name**: `bizmanage`
   - **Username**: `bizmanage_user`
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (0.5GB storage)
4. Click **Create Database**
5. Note the **External Database URL** (you'll need this)

### Step 2: Deploy Backend

1. In Render dashboard, click **"New"** → **"Web Service"**
2. Select **"Deploy an existing repository"** or connect GitHub
3. Configure:
   - **Name**: `bizmanage-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Region**: Same as database

4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<your_external_database_url_from_step_1>
   JWT_ACCESS_SECRET=your_secret_key_here
   JWT_REFRESH_SECRET=your_secret_key_here
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   CORS_ORIGIN=https://bizmanage-frontend.onrender.com,https://yourdomain.com
   ```

5. Click **Deploy**
6. Note the backend URL (e.g., `https://bizmanage-backend.onrender.com`)

### Step 3: Deploy Frontend

1. Click **"New"** → **"Static Site"**
2. Configure:
   - **Name**: `bizmanage-frontend`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. Add Environment Variable:
   ```
   VITE_API_URL=https://bizmanage-backend.onrender.com/api
   ```

4. Click **Deploy**

---

## Option 2: Deploy to Railway.com (Even Simpler)

### Step 1: Create Project
1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"** → **"GitHub Repo"**
3. Select your repository

### Step 2: Add MySQL
1. Click **"Add Services"** → **"MySQL"**
2. Rename to `mysql-db`
3. Railway auto-creates environment variables

### Step 3: Deploy Backend
1. Click **"New Service"** from your project
2. Configure:
   - **Name**: `backend`
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
   - Environment variables are auto-populated

### Step 4: Deploy Frontend
1. Add another service
2. Similar setup for frontend build

---

## Local Development Setup

### Required: Install MySQL Locally
**Windows:**
```bash
# Download from https://dev.mysql.com/downloads/mysql/
# Or use Chocolatey:
choco install mysql
```

**macOS:**
```bash
brew install mysql
```

**Linux:**
```bash
sudo apt-get install mysql-server
```

### Start MySQL
```bash
# Windows
mysql -u root -p

# Then in MySQL shell:
CREATE DATABASE bizmanage;
```

### Run Locally
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
npm install
npm run dev
```

---

## Environment Variables Checklist

### Development (.env in backend/)
```
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=bizmanage
DB_USER=root
DB_PASSWORD=your_password
```

### Production (Render/Railway)
```
DATABASE_URL=mysql://username:password@host:port/bizmanage
NODE_ENV=production
```

---

## First Deployment Checklist

- [ ] Remove auth bypass from `src/context/AuthContext.tsx`
- [ ] Update CORS origins in backend .env
- [ ] Create .gitignore (excludes .env files)
- [ ] Push code to GitHub
- [ ] Set up database on Render/Railway
- [ ] Deploy backend first, then frontend
- [ ] Update frontend API endpoint to deployed backend
- [ ] Test login/signup on deployed site

---

## Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Verify MySQL is running on Render/Railway
- Check environment variables are set

### "CORS error"
- Add frontend domain to `CORS_ORIGIN` in backend .env
- Format: `http://localhost:5173,https://yourdomain.com`

### "Build failed"
- Check build command matches your directory structure
- Ensure Node version is compatible

---

## Database Migrations

After deployment, run migrations:
```bash
# From backend directory
npm run db:migrate
npm run db:seed
```

For Render/Railway, add these as "Build Command" if not auto-running.

---

## Questions?
Contact: [Your Email]
Project: BizManage - University Final Year Project
