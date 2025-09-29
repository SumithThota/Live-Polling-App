# 🚀 Deploy Live Polling App to Render via GitHub

This guide walks you through deploying your Live Polling App to Render using GitHub for automatic deployments.

## 📋 Prerequisites

1. **GitHub Account**: Ensure your project is pushed to GitHub
2. **Render Account**: Create a free account at [render.com](https://render.com)
3. **Project Ready**: Your Live Polling App with all recent changes

## 🔧 Step 1: Prepare Your GitHub Repository

### 1.1 Commit and Push All Changes
```bash
cd C:\Users\thota\Desktop\EDITS\NEW\live-polling-app
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 1.2 Verify Repository Structure
Ensure your GitHub repository has this structure:
```
Live-Polling-App/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.production
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.production
├── render.yaml
├── README.md
└── .env.example
```

## 🌐 Step 2: Deploy to Render

### 2.1 Connect GitHub to Render

1. **Login to Render**: Go to [dashboard.render.com](https://dashboard.render.com)
2. **Connect GitHub**: Click "New +" → "Blueprint"
3. **Connect Repository**: Select your `Live-Polling-App` repository
4. **Authorize Render**: Allow Render to access your GitHub repository

### 2.2 Configure Blueprint Deployment

1. **Select Repository**: Choose your `Live-Polling-App` repository
2. **Blueprint File**: Render will automatically detect `render.yaml`
3. **Service Names**: 
   - Backend: `live-polling-backend`
   - Frontend: `live-polling-frontend`
4. **Review Configuration**: Verify the settings match your render.yaml
5. **Deploy**: Click "Apply" to start deployment

### 2.3 Monitor Deployment

**Backend Service:**
- Build time: ~2-3 minutes
- Health check: `/api/health`
- Logs: Monitor for "Server running on port..."

**Frontend Service:**
- Build time: ~3-5 minutes  
- Static files: Served from `./frontend/build`
- Auto-updates environment variables

## ⚙️ Step 3: Configure Environment Variables

After deployment, you need to manually update some environment variables with your actual service URLs:

### Backend Variables:
- `NODE_ENV=production` ✅ (auto-set)
- `PORT` ✅ (auto-assigned by Render)
- `FRONTEND_URL` ❗ (update manually)

### Frontend Variables:
- `NODE_ENV=production` ✅ (auto-set)
- `REACT_APP_API_URL` ❗ (update manually)
- `REACT_APP_SOCKET_URL` ❗ (update manually)

### 3.1 Update Backend Environment Variables
1. Go to your backend service in Render dashboard
2. Click **Environment** tab
3. Update `FRONTEND_URL` to: `https://your-frontend-service-name.onrender.com`

### 3.2 Update Frontend Environment Variables
1. Go to your frontend service in Render dashboard
2. Click **Environment** tab  
3. Update `REACT_APP_API_URL` to: `https://your-backend-service-name.onrender.com`
4. Update `REACT_APP_SOCKET_URL` to: `https://your-backend-service-name.onrender.com`

**Note**: Replace the service names with your actual Render service URLs.

## 🔍 Step 4: Verify Deployment

### 4.1 Check Services Status
1. **Dashboard**: Both services should show "Live" status
2. **Backend URL**: `https://your-backend-app.onrender.com`
3. **Frontend URL**: `https://your-frontend-app.onrender.com`

### 4.2 Test Application
1. **Open Frontend**: Click the frontend service URL
2. **Create Poll**: Test teacher interface
3. **Join as Student**: Test student registration
4. **Real-time Features**: Test polling and chat
5. **Health Check**: Visit `/api/health` on backend URL

### 4.3 Expected URLs
- **Frontend**: `https://live-polling-frontend.onrender.com`
- **Backend**: `https://live-polling-backend.onrender.com`
- **API Health**: `https://live-polling-backend.onrender.com/api/health`

## 🚨 Troubleshooting

### Common Issues:

**1. Build Failures**
- Check build logs in Render dashboard
- Verify package.json dependencies
- Ensure Node.js version compatibility

**2. CORS Errors**
- Verify FRONTEND_URL environment variable
- Check CORS configuration in server.js
- Ensure credentials: true in frontend

**3. Socket Connection Issues**
- Confirm REACT_APP_SOCKET_URL is set correctly
- Check browser developer console
- Verify WebSocket transport in Render logs

**4. Environment Variables**
- Use Render dashboard to verify auto-set variables
- Check service linking in render.yaml
- Restart services if variables changed

### Debug Commands:
```bash
# Check logs
curl https://your-backend-app.onrender.com/api/health

# Test API endpoint
curl https://your-backend-app.onrender.com/api/current-poll

# Check WebSocket (in browser console)
io.connect('https://your-backend-app.onrender.com')
```

## 🔄 Step 5: Automatic Deployments

### 5.1 Auto-Deploy Setup
- **Trigger**: Push to `main` branch
- **Process**: Render automatically rebuilds both services
- **Time**: ~5-8 minutes for complete deployment

### 5.2 Deployment Workflow
```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Render automatically:
# 1. Detects GitHub push
# 2. Rebuilds affected services  
# 3. Updates environment variables
# 4. Deploys new version
```

## 📊 Step 6: Monitor Performance

### 6.1 Render Dashboard
- **Metrics**: CPU, Memory, Response times
- **Logs**: Real-time application logs
- **Events**: Deployment history and status

### 6.2 Application Monitoring
- **Health Endpoint**: Monitor `/api/health`
- **Connection Stats**: Check active connections
- **Error Tracking**: Monitor application errors

## 🎉 Success!

Your Live Polling App is now deployed on Render with:
- ✅ **Frontend**: Static site with React build
- ✅ **Backend**: Node.js server with WebSocket support
- ✅ **Auto-deploy**: GitHub integration
- ✅ **HTTPS**: Automatic SSL certificates
- ✅ **CDN**: Global content delivery
- ✅ **Monitoring**: Built-in performance metrics

## 📞 Support

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **GitHub Issues**: Create issues in your repository
- **Render Support**: support@render.com

## 🔗 Quick Links After Deployment

Replace with your actual URLs:
- **Live App**: https://live-polling-frontend.onrender.com
- **API Health**: https://live-polling-backend.onrender.com/api/health
- **GitHub Repo**: https://github.com/SumithThota/Live-Polling-App