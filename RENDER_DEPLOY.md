# Deploying MatchMaster to Render

This guide will help you deploy both the frontend and backend to Render in the simplest way possible.

## 🎯 Deployment Strategy

We'll deploy:
1. **Backend** as a Web Service (FastAPI)
2. **Frontend** as a Static Site (React build)
3. **Redis** (optional, if you need it)

## 📋 Prerequisites

- GitHub account with your repository
- Render account (sign up at [render.com](https://render.com))

## 🚀 Step-by-Step Deployment

### Step 1: Deploy Backend (Web Service)

1. **Go to Render Dashboard**
   - Sign in at [dashboard.render.com](https://dashboard.render.com)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Chadbychoice/mixnmaster`
   - Click "Connect"

3. **Configure Backend Service**
   - **Name:** `mixnmaster-backend` (or any name you prefer)
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** 
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type:** Free (or Starter for $7/month if you need more resources)

4. **Add Environment Variables**
   - Click "Environment" tab
   - Add these variables:
     ```
     UPLOAD_DIR=/opt/render/project/src/uploads
     OUTPUT_DIR=/opt/render/project/src/outputs
     PORT=10000
     ```
   - Note: Render uses `$PORT` automatically, but we set it for clarity

5. **Add Persistent Disk (for file storage)**
   - Click "Disks" tab
   - Click "Add Disk"
   - Name: `uploads`
   - Mount Path: `/opt/render/project/src/uploads`
   - Size: 1GB (or more as needed)
   - Click "Add Disk"
   - Repeat for `outputs`:
     - Name: `outputs`
     - Mount Path: `/opt/render/project/src/outputs`
     - Size: 1GB (or more as needed)

6. **Deploy!**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - **Copy your backend URL** (e.g., `https://mixnmaster-backend.onrender.com`)

### Step 2: Deploy Frontend (Static Site)

1. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository: `Chadbychoice/mixnmaster`
   - Click "Connect"

2. **Configure Frontend Service**
   - **Name:** `mixnmaster-frontend` (or any name)
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory:** `build`

3. **Add Environment Variable**
   - Click "Environment" tab
   - Add variable:
     ```
     REACT_APP_API_URL=https://your-backend-url.onrender.com
     ```
   - Replace `your-backend-url` with your actual backend URL from Step 1

4. **Deploy!**
   - Click "Create Static Site"
   - Wait for build to complete
   - Your frontend will be available at `https://mixnmaster-frontend.onrender.com`

### Step 3: Update CORS in Backend (Important!)

After you have your frontend URL, update the backend CORS settings:

1. **Edit `backend/main.py`**
   - Find the CORS middleware section
   - Add your Render frontend URL to `allow_origins`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://mixnmaster-frontend.onrender.com",  # Add your Render URL
        "https://*.onrender.com"  # Allow all Render subdomains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. **Commit and push the changes:**
   ```bash
   git add backend/main.py
   git commit -m "Update CORS for Render deployment"
   git push
   ```
   - Render will automatically redeploy

### Step 4: (Optional) Deploy Redis

If you need Redis for caching/job queues:

1. **Create New Redis Instance**
   - Click "New +" → "Redis"
   - **Name:** `mixnmaster-redis`
   - **Plan:** Free (or Starter)
   - Click "Create Redis"

2. **Update Backend Environment Variable**
   - Go to your backend service
   - Click "Environment" tab
   - Add/Update:
     ```
     REDIS_URL=redis://your-redis-url.onrender.com:6379
     ```
   - Get the Redis URL from your Redis service dashboard

## 🔧 Configuration Files

I've created these files to help with deployment:

- `backend/Procfile` - For Render/Railway start command
- `backend/render.yaml` - Optional Render blueprint (see below)

## 📝 Using Render Blueprint (Advanced)

For one-click deployment, you can create a `render.yaml` file in your root directory:

```yaml
services:
  - type: web
    name: mixnmaster-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: UPLOAD_DIR
        value: /opt/render/project/src/uploads
      - key: OUTPUT_DIR
        value: /opt/render/project/src/outputs
    disk:
      name: uploads
      mountPath: /opt/render/project/src/uploads
      sizeGB: 1
    disk:
      name: outputs
      mountPath: /opt/render/project/src/outputs
      sizeGB: 1

  - type: web
    name: mixnmaster-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./build
    envVars:
      - key: REACT_APP_API_URL
        sync: false
```

Then deploy via Render Dashboard → "New +" → "Blueprint"

## 🎨 Custom Domain (Optional)

1. **Backend:**
   - Go to your backend service
   - Click "Settings" → "Custom Domain"
   - Add your domain (e.g., `api.yourdomain.com`)

2. **Frontend:**
   - Go to your frontend service
   - Click "Settings" → "Custom Domain"
   - Add your domain (e.g., `yourdomain.com`)

## ⚠️ Important Notes

### File Storage
- Render's free tier has **ephemeral storage** (files are deleted on restart)
- Use **Persistent Disks** (as shown in Step 1) for file storage
- Or consider using **AWS S3** or **Cloudinary** for production

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Upgrade to Starter ($7/month) for always-on service

### Memory Limits
- Free tier: 512MB RAM
- Audio processing is memory-intensive
- Consider upgrading if you process large files

### Build Time
- Free tier: 90 minutes/month build time
- Each deployment counts toward this limit

### CORS
- Make sure to update CORS settings in your backend
- Add your Render frontend URL to allowed origins

## 🔍 Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify environment variables are set
- Ensure `requirements.txt` has all dependencies

### Frontend can't connect to backend
- Check `REACT_APP_API_URL` environment variable
- Verify CORS settings in backend
- Check backend URL is correct

### Files not persisting
- Ensure you've added Persistent Disks
- Verify mount paths match environment variables
- Check disk size limits

### Build fails
- Check build logs in Render dashboard
- Verify Node.js/Python versions
- Ensure all dependencies are in `package.json`/`requirements.txt`

## 💰 Cost Estimate

**Free Tier:**
- Backend: Free (with limitations)
- Frontend: Free (with limitations)
- Redis: Free (with limitations)
- **Total: $0/month**

**Starter Plan (Recommended for Production):**
- Backend: $7/month
- Frontend: Free (static sites are always free)
- Redis: $15/month (optional)
- **Total: ~$7-22/month**

## 🚀 Quick Deploy Commands

Once configured, future deployments are automatic:
- Push to `main` branch → Auto-deploy
- Or manually trigger from Render dashboard

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Python Guide](https://render.com/docs/deploy-python)
- [Render Static Sites](https://render.com/docs/static-sites)

## ✅ Checklist

- [ ] Backend deployed and running
- [ ] Backend URL copied
- [ ] Frontend deployed with correct API URL
- [ ] CORS updated in backend
- [ ] Persistent disks added for file storage
- [ ] Environment variables set
- [ ] Tested full workflow (upload → process → download)

---

**Need help?** Check Render's documentation or their support channels!

