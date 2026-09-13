#!/usr/bin/env bash
#
# One-time OSRM preprocessing (Phase 1) for the Sakhi safe-route planner.
#
# Turns OpenStreetMap road data into a routable WALKING graph for Hyderabad:
#   download extract -> clip to Hyderabad bbox -> osrm-extract/partition/customize.
# The resulting data/hyderabad.osrm* files are served by the `osrm` service in
# docker-compose.yml (`osrm-routed --algorithm mld`). Re-run only when you want
# fresher map data. Everything runs in Docker — no host tools needed.
#
# Usage:  cd server/osrm && ./build.sh
set -euo pipefail

cd "$(dirname "$0")"
mkdir -p data
cd data

# --- Tunables -----------------------------------------------------------------
# Geofabrik regional extract that contains Telangana/Hyderabad.
EXTRACT_URL="${EXTRACT_URL:-https://download.geofabrik.de/asia/india/southern-zone-latest.osm.pbf}"
EXTRACT_PBF="southern-zone.osm.pbf"
# Hyderabad metro bounding box:  left,bottom,right,top  (minlon,minlat,maxlon,maxlat)
BBOX="${BBOX:-78.20,17.20,78.70,17.60}"
CITY_PBF="hyderabad.osm.pbf"
# OSRM walking profile shipped inside the backend image.
PROFILE="/opt/foot.lua"
OSRM_IMAGE="ghcr.io/project-osrm/osrm-backend:latest"
OSMIUM_IMAGE="${OSMIUM_IMAGE:-stefda/osmium-tool:latest}"
# -----------------------------------------------------------------------------

echo "→ [1/4] Downloading regional extract (once)…"
if [ ! -f "$EXTRACT_PBF" ]; then
  curl -L --fail -o "$EXTRACT_PBF" "$EXTRACT_URL"
else
  echo "    $EXTRACT_PBF already present — skipping download."
fi

echo "→ [2/4] Clipping to Hyderabad bbox ($BBOX)…"
docker run --rm -v "$PWD:/data" "$OSMIUM_IMAGE" \
  osmium extract -b "$BBOX" "/data/$EXTRACT_PBF" -o "/data/$CITY_PBF" --overwrite
echo "    wrote $CITY_PBF"

echo "→ [3/4] Building the OSRM walking graph (extract → partition → customize)…"
docker run --rm -t -v "$PWD:/data" "$OSRM_IMAGE" \
  osrm-extract -p "$PROFILE" "/data/$CITY_PBF"
docker run --rm -t -v "$PWD:/data" "$OSRM_IMAGE" \
  osrm-partition "/data/hyderabad.osrm"
docker run --rm -t -v "$PWD:/data" "$OSRM_IMAGE" \
  osrm-customize "/data/hyderabad.osrm"

echo "→ [4/4] Done. Graph files:"
ls -1 hyderabad.osrm* 2>/dev/null || true
echo
echo "Now start the router:  docker compose up -d osrm"
echo "Smoke test:  curl 'http://localhost:5000/route/v1/foot/78.474,17.375;78.343,17.435?overview=false'"
