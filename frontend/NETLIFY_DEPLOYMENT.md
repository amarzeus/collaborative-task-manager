# Netlify Deployment Guide for Collaborative Task Manager

## Prerequisites
1. Backend deployed and accessible (e.g., on Render)
2. Netlify account created
3. Frontend repository connected to Netlify

## Deployment Steps

### 1. Configure Environment Variables in Netlify
Go to **Site settings > Build & deploy > Environment** and add:
- `VITE_API_URL` = `https://your-backend-url.com/api/v1`
  (Replace with your actual backend URL)

### 2. Build Settings
These are already configured in `netlify.toml`:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18

### 3. Deploy
Netlify will automatically:
- Install dependencies
- Build the application
- Deploy to production

## Common Issues

### Issue: App shows blank page
**Solution:** SPA routing is now configured via `_redirects` file

### Issue: API calls fail
**Solution:** Set `VITE_API_URL` environment variable in Netlify to your backend URL

### Issue: 404 on refresh
**Solution:** Already fixed - `netlify.toml` redirects all routes to `index.html`

## Files Added for Netlify
- `netlify.toml` - Build configuration and redirects
- `public/_redirects` - SPA routing fallback
- `.env.example` - Environment variable template

## Testing Locally
```bash
# Build production version
npm run build

# Preview production build
npm run preview
```

## After Deployment
1. Test all routes work correctly
2. Verify API calls connect to backend
3. Check real-time notifications (Socket.io)
4. Test authentication flow
