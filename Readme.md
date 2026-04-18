<p align="center">
  <img src="https://img.shields.io/badge/Backend-Django%20REST-0C4B33?style=flat&logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-React%20(Vite)-61DAFB?style=flat&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Storage-AWS%20S3-569A31?style=flat&logo=amazons3&logoColor=white" />
  <img src="https://img.shields.io/badge/Hosting-Railway-0B0D0E?style=flat&logo=railway&logoColor=white" />
  <img src="https://img.shields.io/badge/Hosting-Vercel-000000?style=flat&logo=vercel&logoColor=white" />
</p>

<h1 align="center">Rent A Car App (Fullstack) 🏎️</h1>

<p align="center">
Production-style car rental app with Google OAuth, AWS S3 image management, staff management panel, and isolated <code>prod/staging</code> environments.
</p>

<div align="center">
  <h3>
    <a href="https://rent-a-car-app-three.vercel.app">🖥️ Live Frontend</a>
    |
    <a href="https://rent-a-car-staging-umit.vercel.app">🧪 Staging Environment</a>
  </h3>
</div>

<div align="center">
  <a href="https://rent-a-car-app-three.vercel.app">
    <img src="./rent-a-car-demo-1.gif" alt="rent-a-car-demo" width="900"/>
  </a>
</div>

## 📚 Navigation

- [✨ Overview](#-overview)
- [🚀 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚡ Local Setup](#-local-setup)
- [🐳 Docker Setup](#-docker-setup)
- [🌍 Environments](#-environments)
- [🔐 Environment Files](#-environment-files)
- [📡 Core API Endpoints](#-core-api-endpoints)
- [🧪 Smoke Test](#-smoke-test)
- [📬 Contact](#-contact)

## ✨ Overview
- This project demonstrates a professional fullstack fleet management workflow:
  - **Django REST** backend + **React** frontend isolated on Railway and Vercel.
  - **Google OAuth 2.0** and JWT-based authentication.
  - Automated image upload and hosting via **AWS S3**.
  - Dynamic vehicle filtering by segment, fuel type, and gear.
  - Real-time availability management with separated **production** and **staging** paths.

## 🚀 Features
- **Auth**: User register/login/logout and Google Login integration.
- **Car Listings**: Vehicle listing with advanced filtering (Segment, Gear, Fuel).
- **Details**: Vehicle detail view and daily price calculation.
- **Staff Panel**: Staff-only Car CRUD panel (Add/Edit/Delete Vehicles).
- **Permissions**: Dynamic "Availability" filtering based on user roles.
- **Cloud Storage**: Cloud-based image management using AWS S3.

## 🏗️ Architecture
- `backend/` -> Django REST API.
- `frontend/` -> React (Vite) UI.
- `docker-compose.yml` -> Local fullstack development (`backend + frontend + postgres`).
- **Hosting**:
    - **Backend**: Railway Web Service.
    - **Frontend**: Vercel.
    - **Database**: Neon PostgreSQL (Serverless).
    - **Storage**: AWS S3 Bucket.

## 🛠️ Tech Stack
- Python 3.11 & Django 4.2+.
- Django REST Framework.
- React + Vite + Material UI.
- PostgreSQL.
- AWS S3 (boto3).
- Docker / Docker Compose.
- Railway & Vercel.
- Google OAuth 2.0.

## ⚡ Local Setup

**Backend:**
```bash
cd backend
python -m venv env
source env/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Local URLs:**
  - Backend: http://127.0.0.1:8000
  - Frontend: http://localhost:5173


## 🐳 Docker Setup
```bash
docker compose up --build -d
docker compose ps
```
Note: Local PostgreSQL uses default port 5432. Ensure no local conflicts.


## 🌍 Environments
**Current mapping:**
- Production
  - Frontend: https://rent-a-car-app-three.vercel.app
  - Backend: https://rent-a-car-app-production.up.railway.app
  - Neon branch: main
  - S3 Bucket: rent-a-car-prod-bucket

- Staging
  - Frontend: https://rent-a-car-staging-umit.vercel.app
  - Backend: https://rent-a-car-app-staging.up.railway.app
  - Neon branch: staging
  - S3 Bucket: rent-a-car-staging-bucket


## 🔐 Environment Files
- .env.example -> backend template (AWS, DB, Secret Key)
- frontend/.env.example -> frontend local template
- frontend/.env.production -> frontend production (Vercel injected)

Rules:
- Commit only *.example
- Real secrets are managed via Vercel and Railway dashboards.



## 📡 Core API Endpoints
**Auth:**
- POST /api/users/auth/google/ (Google OAuth)
- POST /api/users/register/
- POST /api/users/auth/login/
- POST /api/users/auth/logout/

**Vehicles (Cars):**
- GET /api/car/ (Public/Auth list)
- POST /api/car/ (Staff only - Upload to S3)
- GET /api/car/{id}/ (Detail)
- PUT/PATCH/DELETE /api/car/{id}/ (Staff only)

## 🧪 Smoke Test
**Detailed runbooks:**
- DEPLOY_CHECKLIST.md
- PROJECT_PROGRESS.md
- AWS_S3_CONFIG.md

## 📬 Contact
- GitHub: @Umit8098
- LinkedIn: Umit Arat