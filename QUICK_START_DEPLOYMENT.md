# 🚀 Quick Start Deployment

## 5-Minute Overview

```
Your Project: React Frontend + Express Backend
Target: Vercel (frontend) + Render (backend)
```

---

## Step 1: Prepare (5 min)
```bash
# 1. Install PostgreSQL driver
cd server
npm install pg

# 2. Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output

# 3. Push to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## Step 2: Deploy Backend on Render (10 min)

### 2.1 Create PostgreSQL Database
- Go to https://render.com → **Dashboard** → **New +** → **PostgreSQL**
- Set Name: `secure-network-print-db`
- Copy the **Internal Database URL**

### 2.2 Deploy Web Service
- **New +** → **Web Service** → Select your GitHub repo
- **Build Command:** `cd server && npm install`
- **Start Command:** `cd server && npm start`
- **Environment Variables:**
```
PORT=3000
NODE_ENV=production
JWT_SECRET=YOUR_GENERATED_SECRET_HERE
DATABASE_URL=PASTE_POSTGRESQL_URL_HERE
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://placeholder.vercel.app (update later)
```
- Click Deploy

### 2.3 Initialize Database
- Wait for deployment → Go to **Shell** tab
- Run: `node server/src/migrate-db.js`
- ✅ See success message

### 2.4 Copy Backend URL
- Example: `https://secure-network-print-api.onrender.com`
- Save this for next step

---

## Step 3: Deploy Frontend on Vercel (5 min)

### 3.1 Go to https://vercel.com
- **Add New** → **Project** → Select repo
- **Root Directory:** `./client`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 3.2 Add Environment Variables
```
VITE_API_URL=https://secure-network-print-api.onrender.com/api
VITE_SOCKET_URL=https://secure-network-print-api.onrender.com
```

### 3.3 Deploy
- Click **Deploy**
- Copy your Vercel URL

### 3.4 Update Render Backend
- Go back to Render → Your service → **Environment**
- Update `FRONTEND_URL` to your Vercel URL
- Redeploy

---

## Test Your App ✅
1. Open Vercel URL in browser
2. Sign up → Upload file → Should work!
3. Check browser console for CORS errors
4. If errors, check Render logs

---

## Environment Variables Checklist

**Backend (Render):**
- [ ] PORT=3000
- [ ] NODE_ENV=production
- [ ] JWT_SECRET=random-string
- [ ] DATABASE_URL=postgresql://...
- [ ] CLOUDINARY_CLOUD_NAME=...
- [ ] CLOUDINARY_API_KEY=...
- [ ] CLOUDINARY_API_SECRET=...
- [ ] FRONTEND_URL=https://your-vercel-url.com

**Frontend (Vercel):**
- [ ] VITE_API_URL=https://your-render-backend.onrender.com/api
- [ ] VITE_SOCKET_URL=https://your-render-backend.onrender.com

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS Error | Update `FRONTEND_URL` on Render, redeploy |
| WebSocket fails | Check `VITE_SOCKET_URL` on Vercel is correct |
| Database error | Run `node server/src/migrate-db.js` in Render Shell |
| Build fails | Check all env vars are set, redeploy |

---

## Files Created

- ✅ `server/src/db.postgres.js` - PostgreSQL setup
- ✅ `server/src/migrate-db.js` - Database initialization
- ✅ `server/.env.example` - Backend env template
- ✅ `client/.env.example` - Frontend env template
- ✅ `client/vercel.json` - Vercel config
- ✅ `render.yaml` - Render config (reference)
- ✅ `DEPLOYMENT_GUIDE.md` - Detailed instructions
- ✅ `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- ✅ `DATABASE_MIGRATION.md` - DB migration details

---

## Next Steps

1. **Real domain?** Add custom domain in Render/Vercel settings
2. **Monitor?** Set up alerts in Render/Vercel dashboards  
3. **Backup?** Enable PostgreSQL backups in Render
4. **Analytics?** Connect Vercel analytics to your project

---

## Docs
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Guide](https://www.postgresql.org/docs)

---

**Enjoy your deployed app! 🎉**
