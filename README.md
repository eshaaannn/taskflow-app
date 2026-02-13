# TaskFlow (Production-Ready Setup)

This repository contains:
- `frontend` (React + Vite)
- `backend` (FastAPI + Supabase)

## 1. Environment Files

Create the env files from examples:

- `frontend/.env` from `frontend/.env.example`
- `backend/.env` from `backend/.env.example`
- `.env.docker` from `.env.docker.example` (for Docker deploy)

Important:
- `VITE_SUPABASE_ANON_KEY` is safe for frontend.
- `SUPABASE_SERVICE_ROLE_KEY` must stay backend-only.

## 2. Run Locally

### Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

## 3. Production Run Commands

### Backend
Use a process manager and run:
```powershell
cd backend
python run.py
```

Set:
- `APP_ENV=production`
- `DEBUG=false`
- `CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com`

### Frontend
```powershell
cd frontend
npm ci
npm run build
npm run preview
```

For real deployment, host `frontend/dist` on your static host and point it to your backend using:
- `VITE_API_URL=https://your-backend-domain.com`

## 4. Deployment Checklist

- [ ] Frontend and backend `.env` values set correctly.
- [ ] Backend CORS only allows real frontend domain(s).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never exposed in frontend.
- [ ] Supabase auth redirect URLs and project settings are correct.
- [ ] Backend health endpoint works: `GET /health`.

## 5. One-Command Docker Deploy (VPS/Server)

This setup uses:
- `frontend` served by Nginx on port `80`
- `backend` (FastAPI) on port `8000`
- Frontend calls backend via `/api` reverse proxy

Steps:
```powershell
copy .env.docker.example .env.docker
# edit .env.docker with your real Supabase values
docker compose --env-file .env.docker up --build -d
```

Stop:
```powershell
docker compose --env-file .env.docker down
```

Check:
- App: `http://<server-ip>/`
- API health: `http://<server-ip>:8000/health`

## 6. Platform Notes

- `VPS`: use the Docker setup above directly.
- `Render/Railway`: deploy `backend` and `frontend` as separate services; set env values from the same examples.
- For HTTPS domains, set:
  - `CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com`
  - Supabase auth site URL/redirect URL to your frontend domain.
