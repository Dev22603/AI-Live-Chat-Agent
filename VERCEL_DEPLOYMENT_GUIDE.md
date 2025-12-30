# Vercel Deployment Guide

**Project:** AI Live Chat Agent
**Framework:** Next.js 16 (App Router)
**Estimated Time:** 10-15 minutes

---

## Prerequisites

Before deploying, ensure you have:

1. ✅ **GitHub repository** - Your code must be pushed to GitHub
2. ✅ **Vercel account** - Sign up at [vercel.com](https://vercel.com) (free)
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

### Option D: Vercel Postgres (Easiest integration)

1. Go to your Vercel dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Postgres**
4. Name your database
5. Vercel automatically injects environment variables
6. Connect and run `database/schema.sql`

---

## Step 2: Deploy to Vercel

### 2.1 Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Choose **GitHub** (or GitLab/Bitbucket)
4. Authorize Vercel to access your repositories
5. Select **`AI-Live-Chat-Agent`** repository
6. Click **"Import"**

### 2.2 Configure Project Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)
- **Node Version:** 20.x (configured in vercel.json)

### 2.3 Add Environment Variables

**CRITICAL:** Before deploying, add these environment variables:

Click **"Environment Variables"** and add:

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

**Environment Scopes:**
- Select **Production**, **Preview**, and **Development** for all variables

**How to find these values:**
- **GOOGLE_API_KEY**: [Google AI Studio API Keys](https://makersuite.google.com/app/apikey)
- **DB_*** values: From your database provider (Supabase/Railway/Neon/Vercel)

**Note:** If using Vercel Postgres, these variables are auto-injected:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes for build to complete
3. Vercel will provide URLs:
   - **Production:** `https://your-project.vercel.app`
   - **Preview:** `https://your-project-git-branch.vercel.app`

---

## Step 3: Verify Deployment

### 3.1 Test the Application

1. Click the Vercel production URL
2. Chat widget should load
3. Try sending a message: "What is your shipping policy?"
4. AI should respond with store information

### 3.2 Check for Errors

If something doesn't work:

1. **Check Build Logs:**
   - Go to **Deployments** tab in Vercel
   - Click on deployment
   - Click **"Building"** to see logs
   - Review error messages

2. **Check Function Logs:**
   - Go to deployment page
   - Click **"Functions"** tab
   - Click on API route function
   - View real-time logs

3. **Common Issues:**
   - ❌ **Database connection error** → Check DB_HOST, DB_PASSWORD are correct
   - ❌ **API key error** → Check GOOGLE_API_KEY is set correctly
   - ❌ **Build failed** → Check Node version, dependencies
   - ❌ **Function timeout** → Check `vercel.json` maxDuration setting

---

## Step 4: Custom Domain (Optional)

### 4.1 Use Vercel Subdomain

1. Go to **Settings** → **Domains**
2. Your project automatically gets: `https://your-project.vercel.app`
3. You can edit the project name in **Settings** → **General**

### 4.2 Add Custom Domain

1. Go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain: `chat.yourdomain.com`
4. Follow DNS configuration instructions:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or add A record with Vercel's IP
5. Vercel automatically provisions SSL certificate

---

## Step 5: Advanced Configuration

### 5.1 Environment Variables via CLI

Install Vercel CLI:
```bash
npm i -g vercel

# Link project
vercel link

# Add environment variables
vercel env add GOOGLE_API_KEY
vercel env add DB_HOST
vercel env add DB_PASSWORD
```

### 5.2 Deploy via CLI

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 5.3 Vercel Postgres Integration

If using Vercel Postgres:

```typescript
// lib/db.ts
import { createPool } from '@vercel/postgres';

export const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});
```

No need to specify individual DB_* variables.

---

## Step 6: Test End-to-End

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
1. Check API routes are working: `https://your-project.vercel.app/api/chat/message`
2. Should see: `{"code":400,"message":"message cant be empty","data":null}`
3. If 404, check **Functions** tab in deployment

### Issue: Database connection timeout

**Solution:**
1. Ensure database allows connections from all IPs: `0.0.0.0/0`
2. Check database is not paused (Supabase/Railway free tiers)
3. Verify environment variables are correct
4. Check **Function Logs** for specific error

### Issue: "Guardrail violation" for normal messages

**Solution:**
1. Check `lib/guardrails/config.ts` patterns
2. View logs in Vercel dashboard
3. Temporarily reduce strictness for testing

### Issue: Function timeout (10s limit on Hobby plan)

**Solution:**
1. Optimize AI response generation
2. Upgrade to Pro plan (60s timeout)
3. Check `vercel.json` maxDuration setting

### Issue: Build fails with "Module not found"

**Solution:**
```bash
# Locally test build
npm install
npm run build

# If successful, push to GitHub
git push origin main

# Vercel auto-redeploys
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

Before going live:

- ✅ Site is live and accessible
- ✅ Chat functionality works end-to-end
- ✅ Messages persist across page refresh
- ✅ AI responds with relevant store information
- ✅ Error handling works (try empty message)
- ✅ Guardrails work (try jailbreak attempt)
- ✅ No console errors in browser DevTools
- ✅ No 404s or 500s in Network tab
- ✅ Database is properly connected (messages saved)
- ✅ SSL certificate is active (https://)
- ✅ Function logs show no errors

---

## Monitoring & Analytics

### Real-Time Logs

1. Go to Vercel dashboard
2. Click **Deployments** → Select deployment
3. Click **Functions** → Select API route
4. View real-time invocation logs

### Analytics (Pro plan)

1. Go to **Analytics** tab
2. View:
   - Page views
   - Function invocations
   - Response times
   - Error rates

### Alerts

1. Go to **Settings** → **Integrations**
2. Add Slack/Discord webhook
3. Get notified of deployment failures

---

## CI/CD & Git Integration

### Automatic Deployments

Vercel automatically deploys:
- **Production:** Every push to `main` branch
- **Preview:** Every push to any branch
- **PR Previews:** Every pull request gets unique URL

### Branch Deployments

```bash
# Create feature branch
git checkout -b feature/new-chat-ui

# Make changes and push
git add .
git commit -m "Update chat UI"
git push origin feature/new-chat-ui

# Vercel creates preview URL
# https://your-project-git-feature-new-chat-ui.vercel.app
```

### Deployment Protection

1. Go to **Settings** → **Deployment Protection**
2. Enable **Vercel Authentication** for preview deployments
3. Protect sensitive preview URLs

---

## Performance Optimization

### Edge Functions (Recommended)

Convert API routes to Edge Runtime for faster response:

```typescript
// app/api/chat/message/route.ts
export const runtime = 'edge';
```

### Caching

```typescript
// Enable caching for static responses
export const revalidate = 3600; // 1 hour
```

### Analytics

```typescript
// Track performance
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Cost Breakdown

| Plan | Price | Limits |
|------|-------|--------|
| **Hobby** | Free | 100GB bandwidth, 100 serverless function hours |
| **Pro** | $20/month | 1TB bandwidth, 1000 function hours, 60s timeout |
| **Enterprise** | Custom | Unlimited, SLA, dedicated support |

**Vercel Postgres Pricing:**
| Tier | Price | Storage | Compute |
|------|-------|---------|---------|
| **Hobby** | Free | 256MB | 0.25 compute units |
| **Pro** | $20/month | Starting 512MB | Scalable |

**Estimated monthly cost for moderate usage:** $0-20 (Hobby tier sufficient for most cases)

---

## Comparison: Vercel vs Netlify

| Feature | Vercel | Netlify |
|---------|--------|---------|
| Next.js Support | ⭐ Native (built by Vercel) | Good (via plugin) |
| Build Speed | Very Fast | Fast |
| Function Timeout (Free) | 10s | 10s |
| Edge Functions | Yes | Yes |
| Bandwidth (Free) | 100GB | 100GB |
| Preview Deployments | Yes | Yes |
| Custom Domains | Unlimited | Unlimited |
| Built-in Postgres | Yes ($20/mo) | No (external) |

**Recommendation:** Use **Vercel** for Next.js apps (native support, better DX)

---

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js on Vercel**: [vercel.com/docs/frameworks/nextjs](https://vercel.com/docs/frameworks/nextjs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Vercel Support**: Available on Pro+ plans

---

## Quick Deploy Button

Add this to your README.md for one-click deployment:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/AI-Live-Chat-Agent&env=GOOGLE_API_KEY,DB_HOST,DB_PORT,DB_USER,DB_PASSWORD,DB_NAME)
```

---

**End of Vercel Deployment Guide**
