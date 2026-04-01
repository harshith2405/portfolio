# Deployment Guide

This project is ready to deploy as:

- `backend`: Django + Channels ASGI app
- `frontend`: Vite React static app

## Recommended Setup

- Deploy the backend to Render, Railway, or any ASGI-capable host
- Deploy the frontend to Vercel or Netlify
- Use Neon Postgres for the database

## Backend

Working directory:

```text
backend
```

Install command:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
```

Start command:

```bash
daphne -b 0.0.0.0 -p $PORT backend.asgi:application
```

The same start command is also provided in:

[`backend/Procfile`](E:\porfolio\backend\Procfile)

Backend environment variables:

```env
DEBUG=False
SECRET_KEY=replace_with_a_long_random_secret_key
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
ALLOWED_HOSTS=your-backend-domain.com,localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=https://your-backend-domain.com,https://your-frontend-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:5173,http://127.0.0.1:5173
TIME_ZONE=Asia/Calcutta
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
SUPER_ADMIN_NAME=your_super_admin_name
SUPER_ADMIN_PASSWORD=your_super_admin_password
```

Template file:

[`backend/.env.example`](E:\porfolio\backend\.env.example)

## Frontend

Working directory:

```text
frontend
```

Install command:

```bash
npm install
```

Build command:

```bash
npm run build
```

Frontend environment variables:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api/
VITE_WS_BASE_URL=wss://your-backend-domain.com
VITE_RESUME_DOWNLOAD_URL=https://your-backend-domain.com/api/portfolio/resume/
```

Template file:

[`frontend/.env.example`](E:\porfolio\frontend\.env.example)

## Important Notes

- `DEBUG` must be `False` in production.
- Rotate all current real secrets before publishing.
- Static files are served through WhiteNoise from Django.
- Presence/websocket support works on a single backend instance with the current in-memory channel layer.
- If you later scale to multiple backend instances, switch Channels to Redis.

## Quick Checklist

1. Create new production API keys and DB credentials.
2. Fill backend env vars from [`backend/.env.example`](E:\porfolio\backend\.env.example).
3. Fill frontend env vars from [`frontend/.env.example`](E:\porfolio\frontend\.env.example).
4. Run backend migrations.
5. Deploy backend first.
6. Deploy frontend with the backend URLs.
7. Log in as super admin and verify chatbot, project popups, and admin tools.
