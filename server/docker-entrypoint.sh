#!/bin/sh
set -e

# Ensure the data dir exists (it may be a fresh named volume).
mkdir -p "$(dirname "${DATABASE_URL#file:}")" "${UPLOADS_DIR:-/data/uploads}"

# Apply any pending migrations to the SQLite database on the volume.
echo "→ Applying database migrations…"
npx prisma migrate deploy

# Optionally seed demo data on first boot (set SEED_ON_START=true).
# Idempotent: the seed upserts, so re-running is safe.
if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "→ Seeding demo data…"
  node prisma/seed.js || echo "(seed skipped or failed — continuing)"
fi

echo "→ Starting Sakhi API…"
exec node dist/main.js
