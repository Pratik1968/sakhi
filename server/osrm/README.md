# Self-hosted OSRM (walking router) for Sakhi

The safe-route planner asks a routing engine for real road alternatives between
two points, then scores each by crime-news exposure. We self-host
[OSRM](https://project-osrm.org/) with the **foot (walking) profile** so routing
matches how people actually move on foot — the public demo server
(`router.project-osrm.org`) is **car-only and rate-limited**.

## How it works — two phases

**Phase 1 — Preprocessing (once, offline).** `build.sh` turns OpenStreetMap road
data into a graph (nodes = intersections, edges = road segments weighted by
walking time) and precomputes shortcuts (OSRM's MLD / Multi-Level Dijkstra
pipeline — the modern equivalent of Contraction Hierarchies). This is why a query
returns in milliseconds instead of searching every street each time.

**Phase 2 — Query (every request).** The backend snaps A/B to the nearest road,
runs a shortest-path search over the contracted graph, asks for up to 3 distinct
alternatives, and gets back each route's geometry (polyline), distance, and
duration as JSON. Sakhi then scores each route by crime exposure and returns the
safest — see `server/src/routes/routes.service.ts`.

## Setup

Requires Docker. From this directory:

```bash
cd server/osrm
./build.sh            # downloads the extract, clips Hyderabad, builds the graph
docker compose up -d osrm   # (run from repo root) starts osrm-routed on :5000
```

`build.sh` produces `data/hyderabad.osrm*`, which the `osrm` service in the
repo-root `docker-compose.yml` mounts and serves with
`osrm-routed --algorithm mld`.

### Smoke test

```bash
curl "http://localhost:5000/route/v1/foot/78.474,17.375;78.343,17.435?overview=false"
# → {"code":"Ok", ...}
```

## Configuration

- **Region / bbox** — defaults to a Hyderabad metro bounding box
  (`78.20,17.20,78.70,17.60`), matching the Hyderabad-only crime dataset.
  Override via env when running `build.sh`:
  ```bash
  BBOX="78.0,17.0,79.0,18.0" ./build.sh          # wider area
  EXTRACT_URL="https://download.geofabrik.de/asia/india-latest.osm.pbf" ./build.sh
  ```
- **Backend wiring** — the API reads `OSRM_URL` (see `server/.env`). In Docker
  it's `http://osrm:5000`; for local `npm run start:dev` it's
  `http://localhost:5000`. If `OSRM_URL` is unset the service falls back to the
  public demo (car profile) so the endpoint still works before you build the
  graph.

## Notes

- The crime dataset is Hyderabad-only, n<5 per locality — this is a methodology
  demo of crime-**news** exposure, **not** a safety guarantee.
- `stefda/osmium-tool` is used to clip the bbox; override with `OSMIUM_IMAGE` if
  you prefer another osmium image.
