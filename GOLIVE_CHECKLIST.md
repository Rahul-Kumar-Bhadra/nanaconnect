# NANACONNECT — FINAL GO-LIVE CHECKLIST

Do these in order. Each one takes about 5 minutes.

=====================================================================
ACCOUNT 1 — NEON (Database)
=====================================================================
URL: https://neon.tech
Action: Sign up → New Project → name it "nanaconnect" → region Asia Pacific
Copy this and save it:
DATABASE_URL = postgresql+asyncpg://[user]:[password]@[host]/nanaconnect

=====================================================================
ACCOUNT 2 — CLOUDINARY (Pandit Photos)
=====================================================================
URL: https://cloudinary.com
Action: Sign up → go to Dashboard → copy all 3 values
Copy these and save them:
CLOUDINARY_CLOUD_NAME = 
CLOUDINARY_API_KEY    = 
CLOUDINARY_API_SECRET = 

=====================================================================
ACCOUNT 3 — RESEND (Emails)
=====================================================================
URL: https://resend.com
Action: Sign up → API Keys → Create API Key → name it "nanaconnect"
Copy this and save it:
RESEND_API_KEY = re_

=====================================================================
ACCOUNT 4 — SENTRY (Error Tracking)
=====================================================================
URL: https://sentry.io
Action: Sign up → Create 2 projects

Project 1: Choose FastAPI → name it "nanaconnect-backend"
Copy this and save it:
SENTRY_DSN = https://

Project 2: Choose React → name it "nanaconnect-frontend"
Copy this and save it:
VITE_SENTRY_DSN = https://

=====================================================================
ACCOUNT 5 — GITHUB (Your Code)
=====================================================================
URL: https://github.com
Action: Sign up → New Repository → name it "nanaconnect" → Public → 
        do NOT add README → Create Repository

Then open terminal in your project folder and run:

git init
git add .
git commit -m "production ready"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/nanaconnect.git
git push -u origin main

=====================================================================
ACCOUNT 6 — RENDER (Backend Hosting)
=====================================================================
URL: https://render.com
Action: Sign up with GitHub → New → Web Service → select nanaconnect repo

Settings:
  Name:            nanaconnect-api
  Root Directory:  panditji-backend
  Environment:     Python 3
  Build Command:   pip install -r requirements.txt
  Start Command:   uvicorn app.main:app --host 0.0.0.0 --port $PORT
  Instance Type:   Free

Environment Variables to add in Render dashboard:
  DATABASE_URL             = (from Neon — Account 1)
  SECRET_KEY               = anyrandomlongstring1234567890abcdef
  FRONTEND_URL             = https://nanaconnect.vercel.app
  CLOUDINARY_CLOUD_NAME    = (from Cloudinary — Account 2)
  CLOUDINARY_API_KEY       = (from Cloudinary — Account 2)
  CLOUDINARY_API_SECRET    = (from Cloudinary — Account 2)
  RESEND_API_KEY           = (from Resend — Account 3)
  SENTRY_DSN               = (backend DSN from Sentry — Account 4)
  RAZORPAY_KEY_ID          = (your Razorpay test key)
  RAZORPAY_KEY_SECRET      = (your Razorpay test secret)

Click "Create Web Service" → wait 5 minutes
Test: https://nanaconnect-api.onrender.com/health
Expected result: {"status":"ok","database":"connected"}

=====================================================================
ACCOUNT 7 — VERCEL (Frontend Hosting)
=====================================================================
URL: https://vercel.com
Action: Sign up with GitHub → Add New Project → import nanaconnect repo

Settings:
  Framework:        Vite
  Root Directory:   ./
  Build Command:    npm run build
  Output Directory: dist

Environment Variables to add in Vercel dashboard:
  VITE_API_URL             = https://nanaconnect-api.onrender.com
  VITE_SENTRY_DSN          = (frontend DSN from Sentry — Account 4)
  VITE_RAZORPAY_KEY_ID     = (your Razorpay test key)

Click "Deploy" → wait 3 minutes
Your live site: https://nanaconnect.vercel.app

=====================================================================
ACCOUNT 8 — CRON-JOB (Keep Render Awake — Free)
=====================================================================
URL: https://cron-job.org
Action: Sign up free → New Cronjob

Settings:
  URL:       https://nanaconnect-api.onrender.com/health
  Schedule:  Every 10 minutes
  Enable:    Yes

This prevents Render free tier from sleeping.

=====================================================================
FINAL TEST CHECKLIST
=====================================================================

After all accounts are set up, test these:

[ ] https://nanaconnect.vercel.app loads homepage
[ ] https://nanaconnect-api.onrender.com/health returns ok
[ ] https://nanaconnect-api.onrender.com/docs shows API docs
[ ] Register new user — welcome email arrives in inbox
[ ] Browse pandits — page loads correctly
[ ] Make a test booking — confirmation email arrives
[ ] Upload a pandit photo — image appears instantly
[ ] Check sentry.io dashboard — shows projects active

=====================================================================
YOU ARE LIVE!
=====================================================================

Your NanaConnect website is now running at:
Frontend:  https://nanaconnect.vercel.app
Backend:   https://nanaconnect-api.onrender.com
API Docs:  https://nanaconnect-api.onrender.com/docs

Total monthly cost: Rs 0
