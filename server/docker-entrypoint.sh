#!/bin/sh
set -e

# Ensure the uploads dir exists (it may be a fresh named volume).
mkdir -p "${UPLOADS_DIR:-/data/uploads}"

# Wait for Postgres to accept migrations (compose healthcheck usually covers
# this, but retry so a slow DB start doesn't crash the API).
echo "→ Waiting for the database…"
i=0
until npx prisma migrate deploy; do
  i=$((i + 1))
  if [ "$i" -ge 20 ]; then
    echo "Database not reachable after 20 attempts — giving up." >&2
    exit 1
  fi
  echo "  …not ready yet (attempt $i), retrying in 3s"
  sleep 3
done

# Optionally seed demo users + crime incidents on boot (SEED_ON_START=true).
# Both seeds upsert, so re-running is safe.
if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "→ Seeding demo users…"
  node prisma/seed.js || echo "(user seed skipped or failed — continuing)"
  echo "→ Seeding crime incidents…"
  node prisma/seed-crime.js || echo "(crime seed skipped or failed — continuing)"
  echo "→ Seeding nearby places…"
  node prisma/seed-places.js || echo "(places seed skipped or failed — continuing)"
fi

echo "→ Starting Sakhi API…"
exec node dist/main.js
