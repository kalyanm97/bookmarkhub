# BookmarkHub

This repository contains a simple bookmarking application with a NestJS backend and a Next.js frontend. The app uses PostgreSQL as the database and supports authentication, bookmarking, and voting.

This README documents everything required to run the project on a fresh machine.

Table of contents
- Prerequisites
- Quick start (Docker)

# BookmarkHub

A small bookmarking app with a NestJS (Fastify) backend, a Next.js frontend (App Router), and PostgreSQL for persistence.

This README gives concise steps to set up and run the project on a fresh machine.

--

## Quick summary

- Dev: Backend runs on port 3001, frontend on 3000 by default.
- Recommended: use Docker Compose to run Postgres locally.
- Environment files: `backend/.env` (copy from `.env.example`) and `frontend/.env.local` (optional).

## Prerequisites

- Node.js 18+ and npm (or pnpm/yarn). Verify:

```bash
node -v
npm -v
```

- Docker & Docker Compose (recommended) OR a running Postgres instance.
- git (to clone the repository).

## Install and run (new machine)

1) Clone the repository

```bash
git clone <repo-url> bookmarkhub
cd bookmarkhub
```

2) Start PostgreSQL (Docker Compose)

```bash
docker compose up -d db
```

If you prefer a local Postgres, create a DB and user matching the values you will set in `backend/.env`.

3) Backend (dev)

```bash
cd backend
cp .env.example .env            # edit values if needed (DB host/port/user/password)
npm install
npm run start:dev               # runs NestJS in watch mode on port 3001
```

4) Frontend (dev)

```bash
cd frontend
cp .env.local.example .env.local || true
npm install
npm run dev                     # Next.js dev server on port 3000
```

Open http://localhost:3000 after both services are running.

## Environment variables

Backend (`backend/.env`) — copy from `backend/.env.example` and set secure values in production.

- PORT (default 3001)
- JWT_SECRET (set a strong secret in prod)
- DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME
- CORS_ORIGIN (comma-separated list of allowed origins)
- COOKIE_SECURE (true in HTTPS/production)

Frontend (`frontend/.env.local`)

- NEXT_PUBLIC_API_BASE (optional) — default is `http://localhost:3001`.

Important: never commit production secrets (JWT secret, DB password) into the repository. Keep `.env` local and use a secrets manager or CI secrets for deployments.

## Database notes

- Schema is in `database/schema.sql` (for reference). The project also uses TypeORM. By default `synchronize: true` is enabled in `backend/src/config/ormconfig.ts`, which auto-syncs schema in dev. For production, set `synchronize: false` and use migrations.
- Developer helper scripts:
    - `scripts/run_bookmarks_query.sh` — run an example feed query against Postgres (requires `psql`).
    - `scripts/check-no-any.sh` — CI helper that fails if the literal `any` token appears in `backend/src` or `frontend/src`.

## Running production build

Backend:

```bash
cd backend
npm ci
npm run build
npm run start:prod
```

Frontend:

```bash
cd frontend
npm ci
npm run build
npm run start
```


## CI

GitHub Actions workflow at `.github/workflows/ci.yml` runs TypeScript and ESLint checks and the `check-no-any.sh` script on pushes and PRs to `main`.

## Troubleshooting

- Backend can't connect to DB:
   - Ensure `docker compose up -d db` is running, or point `backend/.env` to your DB host.
   - Try connecting with: `psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"`.

- Auth or CORS problems:
   - Confirm `CORS_ORIGIN` includes your frontend origin.
   - Backend sets an `access_token` httpOnly cookie. Frontend API calls use credentials: 'include'.

- TypeScript / ESLint complaints:
   - Run `npm run build` or `npx tsc --noEmit -p tsconfig.json` in the failing service to see errors.

## Project layout (top-level)

- `backend/` — NestJS API server (source in `backend/src`)
- `frontend/` — Next.js app (source in `frontend/src`)
- `packages/shared/` — shared DTOs/types used by both services
- `database/schema.sql` — DB schema
- `docker-compose.yml` — postgres service for local dev
- `scripts/` — developer helpers (psql query and CI check)






