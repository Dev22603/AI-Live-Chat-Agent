# Netlify Deployment Guide

**Project:** AI Live Chat Agent
**Framework:** Next.js 16 (App Router)
**Estimated Time:** 15-20 minutes

---

## Prerequisites

Before deploying, ensure you have:

1. ✅ **GitHub repository** - Your code must be pushed to GitHub
2. ✅ **Netlify account** - Sign up at [netlify.com](https://netlify.com) (free)
3. ✅ **Google AI API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
4. ✅ **PostgreSQL Database** - Set up on Supabase, Railway, or Neon (see Database Setup below)

---

## Step 1: Set Up PostgreSQL Database

### Option A: Supabase (Recommended - Free tier available)

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Go to **Database** → **SQL Editor**
4. Copy contents of `database/schema.sql` and execute
5. Go to **Project Settings** → **Database**
6. Note down connection details:
   - Host
   - Port (5432)
   - Database name
   - User
   - Password

### Option B: Railway (Free tier available)

1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection details from **Connect** tab
4. Connect via `psql` or database client
5. Run `database/schema.sql` to create tables

### Option C: Neon (Free tier available)

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Connect and run `database/schema.sql`

---

## Step 2: Deploy to Netlify

### 2.1 Connect Repository

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub**
4. Authorize Netlify to access your repositories
5. Select **`AI-Live-Chat-Agent`** repository
6. Select branch: **`main`** (or your deployment branch)

### 2.2 Configure Build Settings

Netlify should auto-detect Next.js settings, but verify:

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Base directory:** (leave empty)

Click **"Show advanced"** if you need to set Node version:
- **NODE_VERSION:** `20`

### 2.3 Add Environment Variables

**CRITICAL:** Before deploying, add these environment variables:

Click **"Add environment variables"** and add:

```env
# Google AI API Key (REQUIRED)
GOOGLE_API_KEY=your_google_ai_api_key_here

# PostgreSQL Database (REQUIRED)
DB_HOST=your_database_host
DB_PORT=5432
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# Optional: If using Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_key
```

**How to find these values:**
- **GOOGLE_API_KEY**: [Google AI Studio API Keys](https://makersuite.google.com/app/apikey)
- **DB_*** values: From your database provider (Supabase/Railway/Neon)

### 2.4 Deploy

1. Click **"Deploy site"**
2. Wait 2-3 minutes for build to complete
3. Netlify will provide a URL like: `https://random-name-123.netlify.app`

---

## Step 3: Verify Deployment

### 3.1 Test the Application

1. Click the Netlify URL
2. Chat widget should load
3. Try sending a message: "What is your shipping policy?"
4. AI should respond with store information

### 3.2 Check for Errors

If something doesn't work:

1. **Check Build Logs:**
   - Go to **Deploys** tab in Netlify
   - Click on failed deploy
   - Review error messages

2. **Check Function Logs:**
   - Go to **Functions** tab
   - Look for runtime errors

3. **Common Issues:**
   - ❌ **Database connection error** → Check DB_HOST, DB_PASSWORD are correct
   - ❌ **API key error** → Check GOOGLE_API_KEY is set correctly
   - ❌ **Build failed** → Check package.json dependencies

---

## Step 4: Custom Domain (Optional)

### 4.1 Change Site Name

1. Go to **Site settings** → **General**
2. Click **"Change site name"**
3. Enter: `your-name-ai-chat` (must be unique)
4. Your URL becomes: `https://your-name-ai-chat.netlify.app`

### 4.2 Add Custom Domain (Optional)

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow instructions to configure DNS

---

## Step 5: Test End-to-End

Test all features:

- ✅ **Send message** → Should get AI response
- ✅ **Refresh page** → Conversation should persist
- ✅ **Multiple messages** → Should maintain context
- ✅ **Error handling** → Try empty message (should show error)
- ✅ **Guardrails** → Try "ignore previous instructions" (should block)

---

## Troubleshooting

### Issue: "Failed to fetch" errors

**Solution:**
1. Check API routes are working: `https://your-site.netlify.app/api/chat/message`
2. Should see: `{"code":400,"message":"message cant be empty","data":null}`
3. If 404, rebuild site

### Issue: Database connection timeout

**Solution:**
1. Ensure database allows connections from Netlify IPs (all IPs: `0.0.0.0/0`)
2. Check database is not paused (some free tiers pause after inactivity)
3. Verify connection string is correct

### Issue: "Guardrail violation" for normal messages

**Solution:**
1. Check `lib/guardrails/config.ts` patterns
2. Temporarily reduce strictness for testing
3. Check Function logs for specific violation

### Issue: Build fails with "Module not found"

**Solution:**
```bash
# Locally test build
npm install
npm run build

# If successful, push to GitHub and redeploy
```

---

## Environment Variables Reference

| Variable | Required | Example | Where to Get |
|----------|----------|---------|--------------|
| `GOOGLE_API_KEY` | ✅ Yes | `AIzaSyA...` | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `DB_HOST` | ✅ Yes | `db.xxx.supabase.co` | Database provider dashboard |
| `DB_PORT` | ✅ Yes | `5432` | Usually 5432 for PostgreSQL |
| `DB_USER` | ✅ Yes | `postgres` | Database provider dashboard |
| `DB_PASSWORD` | ✅ Yes | `your_password` | Database provider dashboard |
| `DB_NAME` | ✅ Yes | `postgres` | Database provider dashboard |
| `NEXT_PUBLIC_SUPABASE_URL` | ⚠️ Optional | `https://xxx.supabase.co` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | ⚠️ Optional | `eyJhbGc...` | Supabase project settings |

---

## Post-Deployment Checklist

Before submitting assignment:

- ✅ Site is live and accessible
- ✅ Chat functionality works end-to-end
- ✅ Messages persist across page refresh
- ✅ AI responds with relevant store information
- ✅ Error handling works (try empty message)
- ✅ Guardrails work (try jailbreak attempt)
- ✅ No console errors in browser DevTools
- ✅ No 404s or 500s in Network tab
- ✅ Database is properly connected (messages saved)

---

## Submission Information

Once deployed, submit:

1. **GitHub Repository URL**: `https://github.com/yourusername/AI-Live-Chat-Agent`
2. **Deployed Application URL**: `https://your-site.netlify.app`
3. **Form**: [Spur Take-Home Submission Form](link-from-assignment)

---

## Monitoring & Maintenance

### Check Deployment Status
- Netlify Dashboard: [app.netlify.com](https://app.netlify.com)
- View deploy history, logs, and analytics

### Update Deployment
```bash
# Make changes locally
git add .
git commit -m "Update message"
git push origin main

# Netlify auto-deploys on push
```

### View Logs
1. Go to Netlify dashboard
2. Click **Functions** → **API Route**
3. View real-time logs

---

## Cost Breakdown (Free Tier)

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| **Netlify** | 100GB bandwidth/month | $0.20/GB |
| **Supabase** | 500MB database, 2GB bandwidth | $25/month Pro |
| **Google AI** | Free quota (~60 requests/min) | Pay-as-you-go |

**Estimated monthly cost for moderate usage:** $0-5 (within free tiers)

---

## Support

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Next.js on Netlify**: [docs.netlify.com/integrations/frameworks/next-js/](https://docs.netlify.com/integrations/frameworks/next-js/)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

**End of Deployment Guide**
