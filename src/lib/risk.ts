import { CrimeIncident } from './types';

// The Risk zones period segments. 'Now' follows the clock; the other two force
// the elevated night weighting.
export type Period = 'Now' | 'After dark' | 'Weekend';

// Crime types whose risk is up-weighted after dark. Mirrors the backend route
// planner exactly (server/src/routes/routes.service.ts).
export const NIGHT_SENSITIVE = new Set([
  'sexual_offence',
  'robbery',
  'assault',
  'homicide',
]);

// After-dark window = 18:00–05:59 local.
export function isAfterDark(d: Date = new Date()): boolean {
  const h = d.getHours();
  return h >= 18 || h < 6;
}

// Which periods apply the elevated night weighting. 'Now' follows the clock.
export function isNightPeriod(period: Period): boolean {
  return period === 'After dark' || period === 'Weekend' ? true : isAfterDark();
}

// Severity re-scored for the period. Day = recorded severity; night up-weights
// night-sensitive crimes (×1.6) and eases the rest (×0.8). Clamped to 1–5.
export function weightedSeverity(
  inc: Pick<CrimeIncident, 'severity' | 'crimeType'>,
  period: Period,
): number {
  if (!isNightPeriod(period)) return inc.severity;
  const factor = NIGHT_SENSITIVE.has(inc.crimeType) ? 1.6 : 0.8;
  return Math.min(5, Math.max(1, Math.round(inc.severity * factor)));
}
