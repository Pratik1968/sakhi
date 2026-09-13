import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Seeds the NearbyPlace table from prisma/data/places.csv (police stations,
// hospitals and women's support centres, gathered once from OpenStreetMap
// Overpass + a curated support list). Idempotent: each row gets a deterministic
// id derived from category|name|lat, so re-running upserts rather than
// duplicating. To grow the dataset, append rows to that CSV and re-run
// `npm run db:seed:places` (or reboot the container with SEED_ON_START=true).

const CSV_PATH = path.join(__dirname, 'data', 'places.csv');

/** Minimal CSV line splitter that respects double-quoted fields. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseNum(v: string): number | null {
  if (v === undefined || v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const raw = fs.readFileSync(CSV_PATH, 'utf8').trim();
  const lines = raw.split(/\r?\n/);
  const header = splitCsvLine(lines[0]);
  const idx = (name: string) => header.indexOf(name);

  const cols = {
    category: idx('category'),
    name: idx('name'),
    lat: idx('lat'),
    lng: idx('lng'),
    address: idx('address'),
    phone: idx('phone'),
  };

  const counts: Record<string, number> = {};
  let count = 0;
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const f = splitCsvLine(line);

    const category = f[cols.category]?.trim();
    const name = f[cols.name]?.trim();
    const lat = parseNum(f[cols.lat]);
    const lng = parseNum(f[cols.lng]);
    // Skip rows we can't place on the map (nearest-first needs coordinates).
    if (!category || !name || lat === null || lng === null) continue;

    const address = f[cols.address]?.trim() || null;
    const phone = f[cols.phone]?.trim() || null;

    const id = `place-${slugify(category)}-${slugify(name)}-${lat}`;

    const data = {
      category,
      name,
      address,
      phone,
      lat,
      lng,
      source: 'osm-overpass',
    };

    await prisma.nearbyPlace.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
    counts[category] = (counts[category] ?? 0) + 1;
    count++;
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seeded ${count} nearby places from ${path.basename(CSV_PATH)} ` +
      `(${Object.entries(counts)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')})`,
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
