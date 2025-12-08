# Deployment Checklist

## You're seeing CORS errors because:
The backend serverless functions are NOT deployed yet. Your Vercel app is still using the old frontend code.

## To Fix:

### 1. Commit and Push Changes
```powershell
cd c:\Users\Gaming\arc-raiders-bounty
git add .
git commit -m "Add Steam auth backend serverless functions"
git push
```

### 2. Vercel Will Auto-Deploy
- Go to your Vercel dashboard
- Check the deployment logs
- Wait for it to complete

### 3. Add Environment Variable to Vercel
1. Go to Vercel Dashboard → arc-raiders-bounty project
2. Click "Settings" → "Environment Variables"
3. Add new variable:
   - Name: `STEAM_API_KEY`
   - Value: `F0377775693BFC2101486CCAF56B8363`
   - Environments: Production, Preview, Development
4. Click "Save"
5. Trigger a redeploy: Click "Deployments" → Latest → Three dots → "Redeploy"

### 4. Test the Callback URL
Your callback URL should be: `https://arcraidersbounty.vercel.app/auth/steam/callback`

Make sure this is registered in Steam's settings.

## What Happens After Deployment

1. User clicks "Login with Steam"
2. Redirected to Steam
3. Redirected back to: `/auth/steam/callback?openid.xxx=...`
4. Frontend calls: `/api/auth/steam/callback?openid.xxx=...`
5. **Backend** (running on Vercel) calls Steam API (no CORS issues!)
6. Backend returns player data
7. Frontend creates user and logs in

## If You Get an Error:
- Check Vercel deployment logs: https://vercel.com/dashboard
- Verify `STEAM_API_KEY` is set in environment variables
- Check that callback URL matches Steam settings
