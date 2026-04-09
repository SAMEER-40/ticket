# Deployment Guide (Vercel + Render)

This project is split into:

- `frontend/` -> deploy to Vercel
- `backend/` -> deploy to Render (Docker runtime)

## 1) Deploy Backend on Render

Create a new Render Web Service:

- Runtime: `Docker`
- Root Directory: `backend`

`backend/Dockerfile` is already included and ready.

Set these Render environment variables:

- `SPRING_DATASOURCE_URL` = your Render Postgres JDBC URL
- `SPRING_DATASOURCE_USERNAME` = your DB username
- `SPRING_DATASOURCE_PASSWORD` = your DB password
- `SPRING_JPA_HIBERNATE_DDL_AUTO` = `update`
- `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI` = your Keycloak realm issuer URL
- `APP_CORS_ALLOWED_ORIGINS` = `https://<your-vercel-domain>`

Notes:

- Render will provide `PORT`; Docker entrypoint maps it automatically.
- If you want multiple frontend domains, comma-separate them in `APP_CORS_ALLOWED_ORIGINS`.

## 2) Deploy Frontend on Vercel

Create a Vercel project:

- Root Directory: `frontend`
- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Set Vercel environment variables:

- `VITE_API_BASE_URL` = `https://<your-render-backend-domain>`
- `VITE_OIDC_AUTHORITY` = `https://<your-keycloak-domain>/realms/event-ticket-platform`
- `VITE_OIDC_CLIENT_ID` = `event-ticket-platform-app`

## 3) Keycloak Client Configuration

Client: `event-ticket-platform-app`

Set:

- Valid Redirect URIs: `https://<your-vercel-domain>/*`
- Web Origins: `https://<your-vercel-domain>`

## 4) Final Check

After both deploys:

1. Open frontend URL
2. Click login
3. Complete auth and return to app callback
4. Verify dashboard/API actions work
