import type { Tile } from '@/data/sakhi';

// Map a stored incident `type` (lowercase, hyphenated) to an icon + colours.
const TILES: Record<string, Tile> = {
  harassment: { icon: 'shield-alert', bg: '#FFF0EE', fg: '#B92C22' },
  assault: { icon: 'shield-alert', bg: '#FFF0EE', fg: '#B92C22' },
  stalking: { icon: 'eye', bg: '#F1EEFE', fg: '#6B5AE0' },
  'suspicious-person': { icon: 'eye', bg: '#F3F2F5', fg: '#3A383F' },
  theft: { icon: 'triangle-alert', bg: '#FDF3E5', fg: '#D8861F' },
  'unsafe-spot': { icon: 'map-pin', bg: '#FDF3E5', fg: '#D8861F' },
};
const DEFAULT_TILE: Tile = { icon: 'triangle-alert', bg: '#F3F2F5', fg: '#3A383F' };

export function incidentTile(type: string): Tile {
  return TILES[type] ?? DEFAULT_TILE;
}

// "suspicious-person" -> "Suspicious person"
export function humanizeType(type: string): string {
  const words = type.replace(/-/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Incident';
}
