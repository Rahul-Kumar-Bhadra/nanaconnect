# NANACONNECT — COMPLETE DEPLOYMENT GUIDE (FREE STACK)

=====================================================================
STEP 1 — NEON (Free PostgreSQL Database)
=====================================================================

1. Go to: https://neon.tech
2. Click "Sign Up" — use your Google account for fastest signup
3. Click "New Project" — name it: nanaconnect
4. Select region: Asia Pacific (Singapore) — closest to India
5. Click "Create Project"
6. Copy the connection string shown — it looks like this:
   postgresql+asyncpg://user:password@ep-xxx.neon.tech/nanaconnect
7. Save it somewhere — you will need it in Step 6 (Render)

=====================================================================
STEP 2 — CLOUDINARY (Free Image Storage for Pandit Photos)
=====================================================================

1. Go to: https://cloudinary.com
2. Click "Sign Up For Free" — use Google account
3. After login, go to your Dashboard (home page)
4. You will see 3 values — copy all 3:
   CLOUDINARY_CLOUD_NAME = (shown as "Cloud name")
   CLOUDINARY_API_KEY    = (shown as "API Key")
   CLOUDINARY_API_SECRET = (shown as "API Secret" — click eye icon to reveal)
5. Save all 3 — you will need them in Step 6 (Render)

=====================================================================
STEP 3 — RESEND (Free Emails — 3,000/month)
=====================================================================

1. Go to: https://resend.com
2. Click "Sign Up" — use Google account
3. After login, click "API Keys" in left sidebar
4. Click "Create API Key" — name it: nanaconnect
5. Copy the key — it starts with: re_
   RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxx
6. Save it — you will need it in Step 6 (Render)

=====================================================================
STEP 4 — SENTRY (Free Error Tracking — 5,000 errors/month)
=====================================================================

1. Go to: https://sentry.io
2. Click "Get Started" — sign up free
3. Create FIRST project:
   - Click "Create Project"
   - Choose "FastAPI" as platform
   - Name it: nanaconnect-backend
   - Copy the DSN — it looks like:
     SENTRY_DSN = https://xxx@xxx.ingest.sentry.io/xxx
4. Create SECOND project:
   - Click "Create Project" again
   - Choose "React" as platform
   - Name it: nanaconnect-frontend
   - Copy the DSN — it looks like:
     VITE_SENTRY_DSN = https://xxx@xxx.ingest.sentry.io/xxx
5. Save both DSNs — you will need them in Step 6 and Step 7

=====================================================================
STEP 5 — GITHUB (Push Your Code)
=====================================================================

1. Go to: https://github.com
2. Sign up free if you don't have an account
3. Click "New Repository" (green button)
4. Repository name: nanaconnect
5. Keep it Public
6. Do NOT add README or .gitignore — leave all checkboxes empty
7. Click "Create Repository"
8. Now open your terminal / command prompt in your project folder:
   cd "C:\Users\RAHUL KUMAR BHADRA\Desktop\Project Nana"
9. Run these commands one by one:
   git init
   git add .
   git commit -m "initial production setup"
   git branch -M main
   git remote add origin https://github.com/YOURUSERNAME/nanaconnect.git
   git push -u origin main
   (Replace YOURUSERNAME with your actual GitHub username)
10. Refresh GitHub — you should see all your files there

=====================================================================
STEP 6 — RENDER (Free Backend Hosting for FastAPI)
=====================================================================

1. Go to: https://render.com
2. Click "Get Started For Free" — sign up with GitHub account
3. Click "New" → "Web Service"
4. Connect your GitHub repo: nanaconnect
5. Configure the service:
   - Name: nanaconnect-api
   - Root Directory: panditji-backend
   - Environment: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   - Instance Type: Free
6. Scroll down to "Environment Variables" — add ALL of these:

   Key                      Value
   -------                  -------
   DATABASE_URL             (paste from Step 1)
   SECRET_KEY               (make a random string — any 32+ characters)
   FRONTEND_URL             https://nanaconnect.vercel.app
   CLOUDINARY_CLOUD_NAME    (paste from Step 2)
   CLOUDINARY_API_KEY       (paste from Step 2)
   CLOUDINARY_API_SECRET    (paste from Step 2)
   RESEND_API_KEY           (paste from Step 3)
   SENTRY_DSN               (paste backend DSN from Step 4)
   RAZORPAY_KEY_ID          (your Razorpay test key)
   RAZORPAY_KEY_SECRET      (your Razorpay test secret)

7. Click "Create Web Service"
8. Wait 3-5 minutes for first deploy to finish
9. Your backend URL will be: https://nanaconnect-api.onrender.com
10. Test it by visiting: https://nanaconnect-api.onrender.com/health
    You should see: {"status":"ok","database":"connected"}

=====================================================================
STEP 7 — VERCEL (Free Frontend Hosting for React)
=====================================================================

1. Go to: https://vercel.com
2. Click "Sign Up" — use GitHub account
3. Click "Add New Project"
4. Import your GitHub repo: nanaconnect
5. Configure:
   - Framework Preset: Vite
   - Root Directory: ./ (leave as default)
   - Build Command: npm run build
   - Output Directory: dist
6. Click "Environment Variables" — add ALL of these:

   Key                      Value
   -------                  -------
   VITE_API_URL             https://nanaconnect-api.onrender.com
   VITE_SENTRY_DSN          (paste frontend DSN from Step 4)
   VITE_RAZORPAY_KEY_ID     (your Razorpay test key)

7. Click "Deploy"
8. Wait 2-3 minutes
9. Your frontend URL will be: https://nanaconnect.vercel.app

=====================================================================
STEP 8 — TEST EVERYTHING WORKS
=====================================================================

Test these one by one after both are deployed:

1. Open: https://nanaconnect.vercel.app
   - Should load your homepage without errors

2. Open: https://nanaconnect-api.onrender.com/health
   - Should show: {"status":"ok","database":"connected"}

3. Open: https://nanaconnect-api.onrender.com/docs
   - Should show your FastAPI Swagger documentation

4. Register a new user on the website
   - Should receive a welcome email in inbox

5. Browse pandits and make a test booking
   - User should receive booking confirmation email
   - Pandit should receive booking alert email

6. Try uploading a pandit photo
   - Should upload and show preview instantly

7. Check Sentry dashboard at sentry.io
   - Should show your projects are receiving data

=====================================================================
IMPORTANT NOTES
=====================================================================

- Render free tier sleeps after 15 minutes of no traffic.
  To keep it awake, go to https://cron-job.org (free), create a cron
  job that pings https://nanaconnect-api.onrender.com/health
  every 10 minutes.

- Never commit your .env file to GitHub. The .gitignore file
  Antigravity created already handles this.

- For Razorpay live payments later, go to your Razorpay dashboard,
  complete KYC, then replace the test keys with live keys in both
  Render and Vercel environment variable dashboards.

- Every time you push code to GitHub main branch, Render and Vercel
  will automatically redeploy — no manual work needed.

=====================================================================
FREE TIER LIMITS SUMMARY
=====================================================================

Service       Free Limit                  Will it be enough?
---------     ----------                  ------------------
Neon          0.5 GB storage              Yes — easily for starting out
Render        750 hrs/month               Yes — enough for 1 service
Vercel        100 GB bandwidth            Yes — more than enough
Cloudinary    25 GB storage               Yes — hundreds of photos
Resend        3,000 emails/month          Yes — fine for early users
Sentry        5,000 errors/month          Yes — more than enough
GitHub        Unlimited repos             Yes — completely free forever
Cron-job.org  Unlimited cron jobs         Yes — completely free forever
