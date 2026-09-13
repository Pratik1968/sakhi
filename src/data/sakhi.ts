// Static UI configuration for Sakhi screens (option lists, capability labels,
// real helpline numbers, launcher menu, map fallback region). This module holds
// NO fabricated user data — per-user content comes from the backend via hooks.
import { IconName } from '@/components/core/Icon';

export type Tone = 'ink' | 'coral' | 'moss' | 'lilac';
export type Tile = { icon: IconName; bg: string; fg: string };
export type Lead = { type: 'avatar'; name: string; tone: Tone } | { type: 'tile'; tile: Tile };

// ---- Tools launcher menu ----
export type ToolDef = { key: string; icon: IconName; title: string; sub: string; bg: string; fg: string };
export const tools: ToolDef[] = [
  { key: 'zones', icon: 'layers', title: 'Risk zones', sub: 'Live safety heat map', bg: '#FDF3E5', fg: '#D8861F' },
  { key: 'evidence', icon: 'video', title: 'Evidence', sub: 'Audio, video, encrypted', bg: '#F3F2F5', fg: '#3A383F' },
  { key: 'chatbot', icon: 'message-circle', title: 'Ask Sakhi', sub: 'Guidance and first aid', bg: '#F1EEFE', fg: '#6B5AE0' },
  { key: 'nearby', icon: 'map-pin', title: 'Nearby help', sub: 'Police, hospitals, NGOs', bg: '#E8F7EF', fg: '#0F8C5C' },
  { key: 'report', icon: 'triangle-alert', title: 'Report an incident', sub: 'Warn the women behind you', bg: '#FFF0EE', fg: '#B92C22' },
  { key: 'fake', icon: 'phone-call', title: 'Fake call', sub: 'Leave without explaining', bg: '#F3F2F5', fg: '#3A383F' },
  { key: 'timeline', icon: 'clock', title: 'Incident history', sub: 'Reports you’ve submitted', bg: '#F3F2F5', fg: '#3A383F' },
];

// ---- Circle / You shared row shape ----
export type MetaOrSwitchRow = {
  title: string;
  sub: string;
  lead: Lead;
  trailMeta?: string;
  trailSwitch?: boolean;
};

// ---- Helplines (real Indian emergency numbers) ----
export const helplines: MetaOrSwitchRow[] = [
  { title: 'Women helpline · 1091', sub: 'City control room', lead: { type: 'tile', tile: { icon: 'phone', bg: '#F1EEFE', fg: '#6B5AE0' } }, trailMeta: 'Call' },
  { title: 'Domestic abuse · 181', sub: 'Counselling and shelter', lead: { type: 'tile', tile: { icon: 'message-circle', bg: '#E8F7EF', fg: '#0F8C5C' } }, trailMeta: 'Call' },
  { title: 'Ambulance · 108', sub: 'Nearest available unit', lead: { type: 'tile', tile: { icon: 'heart', bg: '#FFF0EE', fg: '#B92C22' } }, trailMeta: 'Call' },
];

// ---- Add guardian: relationship suggestions ----
export const relationshipOptions = ['Sister', 'Mother', 'Partner', 'Friend', 'Flatmate', 'Colleague'] as const;

// ---- You: SOS trigger modes (local device capabilities) ----
export const triggers: MetaOrSwitchRow[] = [
  { title: 'Hold the SOS button', sub: '1.5 seconds. Nothing happens on a tap.', lead: { type: 'tile', tile: { icon: 'shield-alert', bg: '#FFF0EE', fg: '#B92C22' } }, trailSwitch: true },
  { title: 'Shake the phone', sub: 'Three hard shakes', lead: { type: 'tile', tile: { icon: 'activity', bg: '#F3F2F5', fg: '#3A383F' } }, trailSwitch: true },
  { title: 'Power button ×5', sub: 'Works with the screen locked', lead: { type: 'tile', tile: { icon: 'lock', bg: '#F3F2F5', fg: '#3A383F' } }, trailSwitch: true },
  { title: 'Voice phrase', sub: '"Help me" · recognised offline in 11 languages', lead: { type: 'tile', tile: { icon: 'mic', bg: '#F1EEFE', fg: '#6B5AE0' } }, trailSwitch: true },
  { title: 'Watch or panic button', sub: 'Pair a wearable · heart-rate and fall triggers', lead: { type: 'tile', tile: { icon: 'heart', bg: '#E8F7EF', fg: '#0F8C5C' } }, trailSwitch: false },
];

// ---- AI threat detection: sensitivity + what the on-device model can watch ----
export const sensOptions = ['Gentle', 'Balanced', 'Watchful'] as const;
export const sensNote: Record<string, string> = {
  Gentle: 'Only clear signals — a fall, a scream, an SOS phrase.',
  Balanced: 'Adds route deviation and sudden stops at night.',
  Watchful: 'Adds following patterns and long inactivity. More check-ins.',
};
export type SignalRow = { title: string; sub: string; tile: Tile; on: boolean };
export const signals: SignalRow[] = [
  { title: 'Sudden running', sub: 'Accelerometer + gait model', tile: { icon: 'footprints', bg: '#F3F2F5', fg: '#3A383F' }, on: true },
  { title: 'Off the expected route', sub: 'Compares against your usual paths', tile: { icon: 'route', bg: '#F3F2F5', fg: '#3A383F' }, on: true },
  { title: 'Someone following', sub: 'Repeated proximity over 400 m', tile: { icon: 'eye', bg: '#F3F2F5', fg: '#3A383F' }, on: true },
  { title: 'Distress in your voice', sub: 'Emotion model, audio never leaves the phone', tile: { icon: 'mic', bg: '#F3F2F5', fg: '#3A383F' }, on: true },
  { title: 'Fall or long stillness', sub: 'Needs a paired watch', tile: { icon: 'heart', bg: '#F3F2F5', fg: '#3A383F' }, on: false },
];

// ---- Risk zones legend ----
export const periodOptions = ['Now', 'After dark', 'Weekend'] as const;
export const legend = [
  { color: '#17A86E', label: 'Safe' },
  { color: '#F2A33C', label: 'Moderate' },
  { color: '#FF4A3C', label: 'High risk' },
  { color: '#B92C22', label: 'Hotspot' },
];

// ---- Ask Sakhi (chatbot) ----
export type ChatMsg = { from: 'bot' | 'me'; text: string };
export const quickReplies: { label: string; user: string }[] = [
  { label: 'I feel unsafe here', user: 'I feel unsafe here' },
  { label: 'First aid for a cut', user: 'First aid for a cut' },
  { label: 'My rights if I file a case', user: 'My rights if I file a case' },
];

// ---- Nearby help categories ----
export const nearbyOptions = ['Police', 'Hospitals', 'Support'] as const;

// ---- Report ----
export const reportSteps = ['Type', 'Details', 'Sent'];
export const reportTypes = ['Harassment', 'Stalking', 'Theft', 'Assault', 'Suspicious person', 'Unsafe spot'];

// ---- Fake call options ----
export const delayOptions = ['Now', '10 s', '1 min'] as const;
export const fakeOpts: { title: string; sub: string; on: boolean }[] = [
  { title: 'Play a voice on answer', sub: 'A recorded "Where are you? I am outside."', on: true },
  { title: 'Use my default ringtone', sub: 'Sounds exactly like a real call', on: true },
  { title: 'Send my location too', sub: 'Quietly, to your guardians', on: false },
];

// ---- Map fallback region (used until a real GPS fix arrives) ----
export const geo = {
  region: { latitude: 12.9719, longitude: 77.6412, latitudeDelta: 0.012, longitudeDelta: 0.012 },
};
