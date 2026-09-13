# Sakhi backend (NestJS)

REST + Socket.IO API for the Sakhi women's-safety app. **Postgres via Prisma**
(runs as the `db` service in docker-compose). Includes a **safe-route planner**
that ranks OSRM walking routes by crime-news exposure — see
[`osrm/README.md`](./osrm/README.md) to self-host the router.

## Setup

### Option A — Docker (recommended)

From the **repo root**:

```bash
make docker-up      # build image + start API on :4000, migrate & seed on first boot
make docker-logs    # tail logs
make docker-down    # stop
make docker-reset   # wipe the volume (db + uploads) and start fresh
```

Or without make: `docker compose up -d --build`. This starts Postgres (`db`),
the API, and OSRM. Postgres data lives on the `sakhi-pgdata` volume and uploaded
evidence on `sakhi-data`, so both survive restarts and rebuilds. On first boot the
API migrates the schema and seeds crime incidents. No demo users are seeded —
register an account in the app to sign in.

> **OSRM first:** the safe-route planner needs the walking graph. Build it once
> with `make osrm-build` (or `cd server/osrm && ./build.sh`) before the `osrm`
> service can serve routes. Until then, the planner falls back to the public OSRM
> demo (car profile).

Override secrets via env when starting, e.g.:
`JWT_SECRET=... CORS_ORIGIN=https://example.com make docker-up`.

### Option B — Local Node

From the **repo root**: `make server-setup` (installs deps, generates the Prisma
client, migrates, seeds), then `make server-dev`. Or manually:

```bash
cd server
npm install
cp .env.example .env            # point DATABASE_URL at your Postgres; set OSRM_URL
npm run prisma:generate         # generate the Prisma client
npm run prisma:migrate          # create the Postgres schema
npm run db:seed                 # demo users + crime incidents (from prisma/data/*.csv)
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
| Routes     | `POST /api/routes/plan`                      | Safe route: OSRM alts ranked by crime exposure |
|            | `GET /api/routes/incidents`                  | Crime incidents feeding the planner (risk zones) |

## Realtime (Socket.IO)

Connect with the JWT in the handshake: `io(url, { auth: { token } })`.
Server → client events: `location:update`, `sos:new`, `sos:resolved`.
Each user is auto-joined to a private room; services push only to the relevant
guardians.

## Push

`NotificationsService` uses `expo-server-sdk`. On SOS, guardians with a
registered `expoPushToken` receive a high-priority push.
