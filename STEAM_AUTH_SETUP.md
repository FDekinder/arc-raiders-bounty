# Steam Authentication Setup with Vercel

## What Was Created

### Serverless Functions (Backend)
1. **`api/auth/steam/callback.ts`** - Main Steam authentication endpoint
   - Validates OpenID authentication with Steam
   - Fetches player data from Steam API (server-side, no CORS issues)
   - Returns player info to frontend

2. **`api/utils/steam.ts`** - Steam helper functions
   - `validateSteamAuth()` - Validates OpenID response
   - `getSteamPlayerInfo()` - Fetches player data from Steam API

### Configuration
- **`vercel.json`** - Updated to include environment variable setup

### Frontend Updates
- **`src/views/SteamCallbackView.vue`** - Updated to call backend API instead of direct Steam API calls

## Setup Steps

### 1. Set Environment Variables

Add to your `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
STEAM_API_KEY=your_steam_api_key
```

### 2. Get Your Steam API Key

1. Go to https://steamcommunity.com/dev/apikey
2. Login with your Steam account
3. Accept the agreement and get your API key
4. Save it securely

### 3. Deploy to Vercel

```powershell
# Push to GitHub (if not already done)
git add .
git commit -m "Add Steam auth serverless functions"
git push

# On Vercel dashboard:
# 1. Go to your project settings
# 2. Environment Variables
# 3. Add STEAM_API_KEY with your actual key
# 4. Redeploy
```

### 4. Update Steam OpenID Settings

In your Steam login page, make sure the return URL is:
```
https://your-domain.vercel.app/auth/steam/callback
```

## How It Works

```
User clicks "Login with Steam"
    ↓
Redirected to Steam login page
    ↓
User authorizes
    ↓
Steam redirects to: /auth/steam/callback?openid.xxx=...
    ↓
Frontend calls: /api/auth/steam/callback?openid.xxx=...
    ↓
Backend validates OpenID with Steam (server-to-server, no CORS!)
    ↓
Backend fetches player profile from Steam API
    ↓
Backend returns player data to frontend
    ↓
Frontend creates/updates user in Supabase
    ↓
User logged in!
```

## Key Benefits

✅ **No CORS Errors** - API calls are server-to-server  
✅ **Secure** - Steam API key is never exposed to client  
✅ **Scalable** - Serverless functions auto-scale with Vercel  
✅ **Type Safe** - Full TypeScript support  

## Testing Locally

To test with `npm run dev`:
1. Steam needs a valid HTTPS URL - use Vercel deployment for actual testing
2. Or use a tool like `ngrok` to expose your local server with HTTPS

## Troubleshooting

**"Steam API key not configured"**
- Add STEAM_API_KEY to your environment variables

**"Invalid Steam authentication"**
- Check that return URL matches Steam settings
- Verify Steam API key is correct

**Still getting CORS errors?**
- Make sure you're calling `/api/auth/steam/callback` (relative path)
- Not `https://api.steampowered.com` directly from frontend
