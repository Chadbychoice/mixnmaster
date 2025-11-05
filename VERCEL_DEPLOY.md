# Deploying MatchMaster to Vercel

## ⚠️ Important: Vercel Limitations

Vercel is primarily designed for **frontend applications** (React, Next.js, etc.). Your backend is a **FastAPI Python application**, which Vercel doesn't natively support well for serverless functions.

## Recommended Approach: Split Deployment

### Option 1: Vercel (Frontend) + Railway/Render (Backend) ⭐ Recommended

This is the best approach for your stack:

#### Deploy Frontend to Vercel:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Create `vercel.json` in the root directory:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "build"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/frontend/$1"
       }
     ]
   }
   ```

3. **Add build script to `frontend/package.json`:**
   ```json
   {
     "scripts": {
       "build": "react-scripts build",
       "vercel-build": "npm run build"
     }
   }
   ```

4. **Set environment variable in Vercel dashboard:**
   - `REACT_APP_API_URL` = Your backend URL (e.g., `https://your-backend.railway.app`)

5. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

#### Deploy Backend to Railway (Recommended):

1. **Sign up at [railway.app](https://railway.app)**
2. **Create new project from GitHub**
3. **Select your repository**
4. **Add these settings:**
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Set environment variables:**
   - `UPLOAD_DIR=/app/uploads`
   - `OUTPUT_DIR=/app/outputs`
6. **Add volumes for persistent storage:**
   - Mount `uploads` and `outputs` directories

#### Alternative: Deploy Backend to Render:

1. **Sign up at [render.com](https://render.com)**
2. **Create new Web Service**
3. **Connect your GitHub repository**
4. **Settings:**
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Add environment variables:**
   - `UPLOAD_DIR=/opt/render/project/src/uploads`
   - `OUTPUT_DIR=/opt/render/project/src/outputs`

### Option 2: Full Stack on Render (Easier but less optimal)

1. **Create a Web Service on Render**
2. **Use Docker Compose:**
   - Point to your `docker-compose.yml`
   - This will deploy both frontend and backend together

### Option 3: Vercel Serverless Functions (Not Recommended)

You could convert the backend to Vercel serverless functions, but this would require significant refactoring and won't work well for audio processing (10-second timeout limit on free tier, file size limits).

## Step-by-Step: Vercel + Railway Deployment

### Frontend (Vercel):

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Create `vercel.json` in frontend directory:**
   ```json
   {
     "version": 2,
     "buildCommand": "npm run build",
     "outputDirectory": "build",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

3. **Update API URL in your frontend code** to use environment variable:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
   ```

4. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `frontend`
   - Add environment variable: `REACT_APP_API_URL=https://your-backend.railway.app`
   - Deploy!

### Backend (Railway):

1. **Create `railway.json` in backend directory:**
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Create `Procfile` in backend directory:**
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

3. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select your repository
   - Set root directory to `backend`
   - Add environment variables
   - Deploy!

## Environment Variables Needed

### Frontend (Vercel):
- `REACT_APP_API_URL` - Your backend URL

### Backend (Railway/Render):
- `UPLOAD_DIR` - Path for uploads
- `OUTPUT_DIR` - Path for outputs
- `REDIS_URL` (optional) - If using Redis

## Cost Estimates

- **Vercel (Frontend):** Free tier available, $20/month for Pro
- **Railway (Backend):** Free tier available, $5/month for Hobby
- **Render (Backend):** Free tier available, $7/month for Starter

## Important Notes

1. **File Storage:** Vercel and serverless platforms don't support persistent file storage. Consider using:
   - AWS S3
   - Cloudinary
   - Railway Volumes (for Railway)
   - Render Disks (for Render)

2. **CORS:** Make sure your backend allows requests from your Vercel frontend domain

3. **File Size Limits:**
   - Vercel: 100MB limit for serverless functions
   - Railway: Depends on your plan
   - Render: 100MB limit on free tier

4. **Audio Processing:** Audio mastering is CPU-intensive. Consider:
   - Using a dedicated server for backend
   - Implementing queue system (Celery + Redis)
   - Using background jobs for processing

## Quick Start Commands

```bash
# Frontend (Vercel)
cd frontend
npm install -g vercel
vercel login
vercel

# Backend (Railway)
# Just connect GitHub repo through Railway dashboard
```

## Support

For issues:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)

