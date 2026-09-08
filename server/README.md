# Sakhi backend (NestJS)

REST + Socket.IO API for the Sakhi women's-safety app. SQLite via Prisma for
local development (swap `DATABASE_URL` for Postgres in production).

## Setup

### Option A — Docker (recommended)

From the **repo root**:

```bash
make docker-up      # build image + start API on :4000, migrate & seed on first boot
make docker-logs    # tail logs
make docker-down    # stop
make docker-reset   # wipe the volume (db + uploads) and start fresh
```

Or without make: `docker compose up -d --build`. The SQLite database and uploaded
evidence live on the named volume `sakhi-data`, so they survive restarts and rebuilds.
Demo login after first boot: `meera@sakhi.app` / `password123`.

Override secrets via env when starting, e.g.:
`JWT_SECRET=... CORS_ORIGIN=https://example.com make docker-up`.

### Option B — Local Node

From the **repo root**: `make server-setup` (installs deps, generates the Prisma
client, migrates, seeds), then `make server-dev`. Or manually:

```bash
cd server
npm install
cp .env.example .env            # adjust JWT_SECRET / PORT if needed
npm run prisma:generate         # generate the Prisma client
npm run prisma:migrate          # create the SQLite schema
npm run db:seed                 # optional demo data (meera@sakhi.app / password123)
npm run start:dev               # http://localhost:4000/api
```

Run `make help` (repo root) to see every setup/run/docker target.

## Auth

- `POST /api/auth/register` `{ name, email, phone?, password }` → `{ token, user }`
- `POST /api/auth/login` `{ email, password }` → `{ token, user }`
- `GET /api/auth/me` (Bearer) → current user

All other routes require `Authorization: Bearer <token>`.

## Endpoints

| Area       | Method & path                                | Notes |
|------------|----------------------------------------------|-------|
| Devices    | `POST /api/devices/token`                    | Register Expo push token |
| Guardians  | `GET/POST /api/guardians`                    | List / invite |
|            | `PATCH /api/guardians/:id`                   | Change watch mode/status (owner) |
|            | `POST /api/guardians/:id/accept|decline`     | Guardian responds to invite |
|            | `GET /api/guardians/watching`                | Circles I watch over |
| Location   | `POST /api/location`                         | Ping; broadcasts to guardians |
|            | `GET /api/location/:userId/latest`           | `:userId` or `me` |
| SOS        | `POST /api/sos`                              | Raise SOS (push + realtime) |
|            | `POST /api/sos/:id/resolve|cancel`           | End an SOS |
|            | `GET /api/sos` · `GET /api/sos/feed`         | My history · guardees' active SOS |
| Incidents  | `POST/GET /api/incidents`, `GET .../nearby`  | Report / list / community map |
| Evidence   | `POST /api/evidence` (multipart `file`)      | Upload; served at `/uploads/*` |

## Realtime (Socket.IO)

Connect with the JWT in the handshake: `io(url, { auth: { token } })`.
Server → client events: `location:update`, `sos:new`, `sos:resolved`.
Each user is auto-joined to a private room; services push only to the relevant
guardians.

## Push

`NotificationsService` uses `expo-server-sdk`. On SOS, guardians with a
registered `expoPushToken` receive a high-priority push.
