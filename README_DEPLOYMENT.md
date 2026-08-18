# Quick Start: Local Development & Deployment

## 🚀 Local Development (MySQL)

### Prerequisites
1. **MySQL installed** and running on `localhost:3306`
2. **Node.js** v20+
3. Create database:
   ```bash
   mysql -u root -p
   # In MySQL shell:
   CREATE DATABASE bizmanage;
   ```

### Run locally
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# Runs on http://localhost:5000

# Terminal 2: Frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Default Test Users (auto-seeded)
- **Admin**: admin@bizmanage.com / admin123
- **Manager**: manager@bizmanage.com / admin123
- **User**: user@bizmanage.com / admin123

---

## ☁️ Deploy to Render.com (5 minutes)

### Quick Steps
1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Create MySQL database (free tier)
4. Deploy backend web service
5. Deploy frontend static site

**Full details**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Environment Variables for Render
```
DATABASE_URL=mysql://user:password@host:port/bizmanage
JWT_ACCESS_SECRET=your-secret-key
NODE_ENV=production
```

---

## 📋 Pre-Deployment Checklist

- [ ] `npm run build` succeeds for both frontend and backend
- [ ] Test login with seeded credentials locally
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Remove any console.logs or debugging code
- [ ] Update CORS origins for production domain
- [ ] Database credentials are secure (use `.env` not hardcoded)

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| MySQL connection fails | Ensure MySQL is running: `mysql -u root -p` |
| Port 5000 already in use | Change `PORT` in .env or kill process |
| Module not found | Run `npm install` in backend AND frontend |
| Database not created | Run `npm run db:migrate` in backend |
| Login doesn't work | Check seeded users with `npm run db:seed` |
| CORS error on production | Add frontend domain to backend CORS_ORIGIN env var |

---

## 📚 Project Structure
```
├── src/                    # Frontend (React + Vite)
│   ├── pages/Auth/        # Login/Signup
│   ├── pages/Dashboard/   # App pages
│   └── context/AuthContext.tsx
├── backend/               # Node.js + Express
│   ├── src/
│   │   ├── models/        # Database models
│   │   ├── migrations/    # Database migrations
│   │   ├── seeders/       # Initial data
│   │   └── routes/        # API endpoints
│   └── .env               # Database config
├── DEPLOYMENT_GUIDE.md    # Full deployment docs
└── README.md              # Project documentation
```

---

## 🎓 University Project Notes
- Database: **MySQL** (as per requirements)
- Deployment: **Render.com or Railway.app** (simple, reliable)
- No complex DevOps setup needed
- Can be deployed in under 30 minutes
- Free tier sufficient for evaluation

---

## 📞 Next Steps
1. Install MySQL locally
2. Update `.env` with MySQL credentials
3. Run `npm run dev` in backend folder
4. Verify login works with test credentials
5. When ready, push to GitHub and deploy

**Questions?** Check DEPLOYMENT_GUIDE.md or common issues above.
