import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Seeds the CrimeIncident table from prisma/data/incidents_geo.csv (the Phase-6
// output of the sakhi_model pipeline). Idempotent: each row gets a deterministic
// id derived from crime_type|locality|incident_date, so re-running upserts rather
// than duplicating. To grow the dataset, append rows to that CSV and re-run
// `npm run db:seed:crime` (or reboot the container with SEED_ON_START=true).

const CSV_PATH = path.join(__dirname, 'data', 'incidents_geo.csv');

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
    crimeType: idx('crime_type'),
    locality: idx('locality'),
    incidentDate: idx('incident_date'),
    severity: idx('severity'),
    timeOfDay: idx('time_of_day'),
    nArticles: idx('n_articles'),
    lat: idx('lat'),
    lon: idx('lon'),
    zone: idx('zone'),
    commissionerate: idx('commissionerate'),
    geoConfidence: idx('geo_confidence'),
  };

  let count = 0;
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const f = splitCsvLine(line);

    const crimeType = f[cols.crimeType]?.trim();
    const locality = f[cols.locality]?.trim();
    const lat = parseNum(f[cols.lat]);
    const lon = parseNum(f[cols.lon]);
    // Skip rows we can't place on the map (routing needs coordinates).
    if (!crimeType || !locality || lat === null || lon === null) continue;

    const dateStr = f[cols.incidentDate]?.trim();
    const incidentDate = dateStr ? new Date(dateStr) : null;

    const id = `seed-${slugify(crimeType)}-${slugify(locality)}-${slugify(dateStr || 'na')}`;

    const data = {
      crimeType,
      locality,
      incidentDate: incidentDate && !isNaN(incidentDate.getTime()) ? incidentDate : null,
      severity: Math.round(parseNum(f[cols.severity]) ?? 1),
      timeOfDay: f[cols.timeOfDay]?.trim() || 'unknown',
      nArticles: Math.round(parseNum(f[cols.nArticles]) ?? 1),
      lat,
      lon,
      zone: f[cols.zone]?.trim() || null,
      commissionerate: f[cols.commissionerate]?.trim() || null,
      geoConfidence: parseNum(f[cols.geoConfidence]),
      source: 'gdelt-news',
    };

    await prisma.crimeIncident.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
    count++;
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${count} crime incidents from ${path.basename(CSV_PATH)}`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
