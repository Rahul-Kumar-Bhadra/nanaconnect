# 🕉️ NanaConnect – Pandit Booking Platform

## 📌 Project Description
NanaConnect is a professional platform that enables users to book Pandits for various religious ceremonies. It features a robust Admin Dashboard for management and a dedicated Pandit Panel for availability and schedule handling.

## 🚀 Tech Stack
### 🖥️ Frontend
- **React.js** (Vite)
- **Tailwind CSS / Shadcn/UI**
- **Lucide React** (Icons)
- **Axios & TanStack Query** (API & State)

### ⚙️ Backend
- **Python / FastAPI**
- **SQLAlchemy (ORM)**
- **SQLite** (Database)
- **Pydantic** (Validation)

### 🔐 Authentication
- **OAuth2 / JWT tokens**
- **Strong Role-based Access Control** (User, Pandit, Admin)

## 🏗️ Project Structure
```text
Project Nana/
├── panditji-backend/       # FastAPI Backend
│   ├── app/
│   │   ├── routers/        # API Routes (Auth, Admin, Pandits)
│   │   ├── models.py       # DB Models
│   │   └── main.py         # Entry point
│   └── panditji.db         # SQLite database
│
├── puja-connect-pro-main/  # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Admin, Pandit & User Pages
│   │   └── api/            # Backend integration
│   └── vite.config.ts
│
└── .gitignore              # Root Git configuration
```

## ⚡ Deployment Instructions (Vercel/Netlify)
If you are deploying to **Vercel**, ensure you configure the following settings:
- **Root Directory**: `puja-connect-pro-main`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: `Vite`

## 🛠️ Installation & Setup
### 1. Backend
```bash
cd panditji-backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
### 2. Frontend
```bash
cd puja-connect-pro-main
npm install
npm run dev
```

## 🛡️ Admin Access
- **Email**: `subharahuladmin2026@gmail.com`
- **Password**: `brocode@2006`