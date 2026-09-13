// Shared formatting + guardian-display helpers used across screens.
import type { Guardian } from '@/lib/types';

export type Tone = 'ink' | 'coral' | 'moss' | 'lilac';

export function firstName(name?: string | null): string {
  return name?.trim().split(/\s+/)[0] ?? 'You';
}

export function minutesSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

export function timeAgo(iso: string): string {
  const mins = minutesSince(iso);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

/** "Tue, 10 Feb" — today's date, device locale-independent. */
export function shortDate(d: Date = new Date()): string {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

/**
 * Canonicalise a contact value before it goes to the backend (which matches
 * email/phone exactly). Emails are lower-cased; phone numbers have spaces,
 * dashes, dots and brackets stripped. A leading "+" is kept — dropping it
 * would corrupt international numbers.
 */
export function normalizeContact(raw: string): string {
  const v = raw.trim();
  if (v.includes('@')) return v.toLowerCase();
  const plus = v.startsWith('+') ? '+' : '';
  return plus + v.replace(/[\s\-().]/g, '').replace(/^\+/, '');
}

export type CircleRow = {
  key: string;
  title: string;
  subtitle: string;
  tone: Tone;
  relationship: string | null;
  pill: { kind: 'status'; tone: 'safe'; label: string } | { kind: 'meta'; label: string };
};

/** Map a backend GuardianLink to display copy/pill/tone. */
export function toCircleRow(g: Guardian): CircleRow {
  const title = g.guardian?.name ?? g.name;
  const base = { key: g.id, title, relationship: g.relationship };
  switch (g.status) {
    case 'ACTIVE':
      return { ...base, subtitle: 'Watching now', tone: 'coral', pill: { kind: 'status', tone: 'safe', label: 'Live' } };
    case 'SOS_ONLY':
      return { ...base, subtitle: 'Alerted on SOS only', tone: 'moss', pill: { kind: 'meta', label: 'SOS' } };
    case 'PENDING':
      return { ...base, subtitle: 'Invite pending', tone: 'lilac', pill: { kind: 'meta', label: 'Pending' } };
    default:
      return { ...base, subtitle: 'Declined', tone: 'ink', pill: { kind: 'meta', label: 'Declined' } };
  }
}
