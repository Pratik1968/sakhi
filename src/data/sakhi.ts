// Verbatim screen data ported from the Claude Design project
// "Sakhi Prototype.dc.html" / "Sakhi Screen.dc.html" (renderVals()).
import { IconName } from '@/components/core/Icon';

export type Tone = 'ink' | 'coral' | 'moss' | 'lilac';
export type PillTone = 'safe' | 'alert' | 'caution' | 'rest' | 'offline';
export type Pct = `${number}%`;

export type Tile = { icon: IconName; bg: string; fg: string };
export type Lead = { type: 'avatar'; name: string; tone: Tone } | { type: 'tile'; tile: Tile };

// ---- Live ----
export const bars = [22, 38, 55, 70, 92];
export const bars2 = [60, 48, 72, 66, 82];
export const bars3 = [90, 64, 78, 52, 88];

export type GuardianRow = {
  name: string;
  status: string;
  tone: Tone;
  pill: { kind: 'status'; tone: 'safe'; label: string } | { kind: 'meta'; label: string };
};
export const guardians: GuardianRow[] = [
  { name: 'Priya Sharma', status: 'Watching now', tone: 'coral', pill: { kind: 'status', tone: 'safe', label: 'Live' } },
  { name: 'Nikhil Rao', status: 'Alerted on SOS only', tone: 'moss', pill: { kind: 'meta', label: 'SOS' } },
  { name: 'Divya Kulkarni', status: 'Invite pending', tone: 'lilac', pill: { kind: 'meta', label: 'Pending' } },
];

// ---- Tools ----
export type ToolDef = { key: string; icon: IconName; title: string; sub: string; bg: string; fg: string };
export const tools: ToolDef[] = [
  { key: 'ai', icon: 'activity', title: 'AI threat detection', sub: 'Motion, route and voice models', bg: '#F1EEFE', fg: '#6B5AE0' },
  { key: 'routes', icon: 'route', title: 'Safe route', sub: 'Lit, watched, busy streets', bg: '#E8F7EF', fg: '#0F8C5C' },
  { key: 'zones', icon: 'layers', title: 'Risk zones', sub: 'Live safety heat map', bg: '#FDF3E5', fg: '#D8861F' },
  { key: 'evidence', icon: 'video', title: 'Evidence', sub: 'Audio, video, encrypted', bg: '#F3F2F5', fg: '#3A383F' },
  { key: 'chatbot', icon: 'message-circle', title: 'Ask Sakhi', sub: 'Guidance and first aid', bg: '#F1EEFE', fg: '#6B5AE0' },
  { key: 'nearby', icon: 'map-pin', title: 'Nearby help', sub: 'Police, hospitals, NGOs', bg: '#E8F7EF', fg: '#0F8C5C' },
  { key: 'report', icon: 'triangle-alert', title: 'Report an incident', sub: 'Warn the women behind you', bg: '#FFF0EE', fg: '#B92C22' },
  { key: 'fake', icon: 'phone-call', title: 'Fake call', sub: 'Leave without explaining', bg: '#F3F2F5', fg: '#3A383F' },
  { key: 'timeline', icon: 'clock', title: 'Incident history', sub: 'Last SOS · 9 Feb', bg: '#F3F2F5', fg: '#3A383F' },
];

// ---- Circle ----
export const chips: { name?: string; tone?: Tone; add?: boolean }[] = [
  { name: 'Priya Sharma', tone: 'coral' },
  { name: 'Nikhil Rao', tone: 'moss' },
  { name: 'Divya Kulkarni', tone: 'lilac' },
  { name: 'Amma', tone: 'ink' },
  { add: true },
];

export type MetaOrSwitchRow = {
  title: string;
  sub: string;
  lead: Lead;
  trailMeta?: string;
  trailSwitch?: boolean;
};

export const priority: MetaOrSwitchRow[] = [
  { title: '1 · Priya Sharma', sub: 'Called first, always', lead: { type: 'avatar', name: 'Priya Sharma', tone: 'coral' }, trailMeta: 'Sister' },
  { title: '2 · Nikhil Rao', sub: 'Called if Priya does not answer', lead: { type: 'avatar', name: 'Nikhil Rao', tone: 'moss' }, trailMeta: 'Flatmate' },
  { title: '3 · Amma', sub: 'Gets an SMS with the live link', lead: { type: 'avatar', name: 'Amma', tone: 'ink' }, trailMeta: 'Family' },
  { title: 'Police · 112', sub: 'Dialled when no guardian answers within 60 seconds', lead: { type: 'tile', tile: { icon: 'siren', bg: '#FFF0EE', fg: '#B92C22' } }, trailSwitch: true },
];

export const helplines: MetaOrSwitchRow[] = [
  { title: 'Women helpline · 1091', sub: 'City control room', lead: { type: 'tile', tile: { icon: 'phone', bg: '#F1EEFE', fg: '#6B5AE0' } }, trailMeta: 'Call' },
  { title: 'Domestic abuse · 181', sub: 'Counselling and shelter', lead: { type: 'tile', tile: { icon: 'message-circle', bg: '#E8F7EF', fg: '#0F8C5C' } }, trailMeta: 'Call' },
  { title: 'Ambulance · 108', sub: 'Nearest available unit', lead: { type: 'tile', tile: { icon: 'heart', bg: '#FFF0EE', fg: '#B92C22' } }, trailMeta: 'Call' },
];

// ---- You ----
export const triggers: MetaOrSwitchRow[] = [
  { title: 'Hold the SOS button', sub: '1.5 seconds. Nothing happens on a tap.', lead: { type: 'tile', tile: { icon: 'shield-alert', bg: '#FFF0EE', fg: '#B92C22' } }, trailSwitch: true },
  { title: 'Shake the phone', sub: 'Three hard shakes', lead: { type: 'tile', tile: { icon: 'activity', bg: '#F3F2F5', fg: '#3A383F' } }, trailSwitch: true },
  { title: 'Power button ×5', sub: 'Works with the screen locked', lead: { type: 'tile', tile: { icon: 'lock', bg: '#F3F2F5', fg: '#3A383F' } }, trailSwitch: true },
  { title: 'Voice phrase', sub: '"Help me" · recognised offline in 11 languages', lead: { type: 'tile', tile: { icon: 'mic', bg: '#F1EEFE', fg: '#6B5AE0' } }, trailSwitch: true },
  { title: 'Watch or panic button', sub: 'Noise Colorfit paired · heart-rate and fall triggers', lead: { type: 'tile', tile: { icon: 'heart', bg: '#E8F7EF', fg: '#0F8C5C' } }, trailSwitch: false },
];

export const account: { title: string; sub: string; lead: Lead }[] = [
  { title: 'Medical details', sub: 'Blood group O+ · asthma · no allergies', lead: { type: 'tile', tile: { icon: 'heart', bg: '#FFF0EE', fg: '#B92C22' } } },
  { title: 'Face and biometric unlock', sub: 'Face ID on · PIN backup set', lead: { type: 'tile', tile: { icon: 'shield-check', bg: '#F3F2F5', fg: '#3A383F' } } },
  { title: 'Evidence storage', sub: '2.1 GB encrypted · auto-delete after 90 days', lead: { type: 'tile', tile: { icon: 'lock', bg: '#F3F2F5', fg: '#3A383F' } } },
  { title: 'Who can see my location', sub: '3 guardians · nobody else, ever', lead: { type: 'tile', tile: { icon: 'eye', bg: '#F1EEFE', fg: '#6B5AE0' } } },
  { title: 'Language', sub: 'English · हिंदी · ಕನ್ನಡ', lead: { type: 'tile', tile: { icon: 'message-circle', bg: '#F3F2F5', fg: '#3A383F' } } },
];

// ---- AI threat detection ----
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
export type TimelineRow = { icon: IconName; tone: 'alert' | 'caution' | 'safe' | 'neutral'; title: string; place: string; time: string };
export const detections: TimelineRow[] = [
  { icon: 'footprints', tone: 'caution', title: 'Pace jumped to a run', place: '100 Ft Road', time: '21:26' },
  { icon: 'route', tone: 'neutral', title: 'Back on your usual route', place: '12th Main', time: '21:29' },
  { icon: 'shield-check', tone: 'safe', title: 'Check-in confirmed by you', place: 'Indiranagar', time: '21:31' },
];

// ---- Safe route ----
export type RouteDef = { id: string; name: string; time: string; score: string; pct: Pct; barColor: string; why: string };
export const routes: RouteDef[] = [
  { id: 'r1', name: 'Main road', time: '18 min', score: 'SAFEST', pct: '88%', barColor: '#0F8C5C', why: 'Lit the whole way · 3 CCTV clusters · busy till midnight' },
  { id: 'r2', name: 'Metro side', time: '14 min', score: 'GOOD', pct: '71%', barColor: '#D8861F', why: 'Shortest · one unlit stretch near the underpass' },
  { id: 'r3', name: 'Park cut-through', time: '11 min', score: 'AVOID', pct: '34%', barColor: '#E23A2E', why: '2 reports this week · no lighting after 21:00' },
];

// ---- Risk zones ----
export const periodOptions = ['Now', 'After dark', 'Weekend'] as const;
export const legend = [
  { color: '#17A86E', label: 'Safe' },
  { color: '#F2A33C', label: 'Moderate' },
  { color: '#FF4A3C', label: 'High risk' },
  { color: '#B92C22', label: 'Hotspot' },
];
export type ZoneRow = { title: string; sub: string; tile: Tile; pillTone: PillTone; pillLabel: string };
export const zoneRows: ZoneRow[] = [
  { title: 'Underpass, 100 Ft Road', sub: '4 reports this month · unlit after 21:00', tile: { icon: 'triangle-alert', bg: '#FFF0EE', fg: '#B92C22' }, pillTone: 'alert', pillLabel: 'High' },
  { title: 'Metro exit B', sub: 'Crowded, CCTV covered, guards till 23:00', tile: { icon: 'shield-check', bg: '#E8F7EF', fg: '#0F8C5C' }, pillTone: 'safe', pillLabel: 'Safe' },
  { title: 'Old bus depot lane', sub: 'Low footfall between 22:00 and 05:00', tile: { icon: 'map-pin', bg: '#FDF3E5', fg: '#D8861F' }, pillTone: 'caution', pillLabel: 'Moderate' },
  { title: '12th Main market', sub: 'Busy till midnight · patrol every 40 min', tile: { icon: 'shield', bg: '#E8F7EF', fg: '#0F8C5C' }, pillTone: 'safe', pillLabel: 'Safe' },
];

// ---- Evidence ----
export const files: { title: string; sub: string; tile: Tile; meta: string }[] = [
  { title: 'Audio · SOS 9 Feb', sub: '4 min 12 s · uploaded, hash sealed', tile: { icon: 'mic', bg: '#F3F2F5', fg: '#3A383F' }, meta: '21:31' },
  { title: 'Video · rear camera', sub: '38 s · 1080p', tile: { icon: 'video', bg: '#F3F2F5', fg: '#3A383F' }, meta: '21:31' },
  { title: 'Video · front camera', sub: '38 s · 1080p', tile: { icon: 'video', bg: '#F3F2F5', fg: '#3A383F' }, meta: '21:31' },
  { title: 'GPS track', sub: '1.9 km · 412 points', tile: { icon: 'map-pin', bg: '#F3F2F5', fg: '#3A383F' }, meta: '21:35' },
];

// ---- Ask Sakhi (chatbot) ----
export type ChatMsg = { from: 'bot' | 'me'; text: string };
export const initialChat: ChatMsg[] = [
  { from: 'bot', text: "I'm here. Tell me what's happening and I'll keep it short." },
  { from: 'me', text: 'Someone is following me' },
  { from: 'bot', text: 'Walk into the nearest lit shop — Ratna Stores is 120 m ahead. Want me to tell Priya where you are?' },
];
export const quickReplies: { label: string; user: string; bot: string }[] = [
  { label: 'I feel unsafe here', user: 'I feel unsafe here', bot: 'Stay where there are people. The nearest police station is 600 m north — want directions, or should I start a check-in?' },
  { label: 'First aid for a cut', user: 'First aid for a cut', bot: 'Press a clean cloth on it firmly for 10 minutes. Do not lift to check. If it soaks through, add another cloth on top and call 108.' },
  { label: 'My rights if I file a case', user: 'My rights if I file a case', bot: 'You can file a Zero FIR at any station, in any city. A woman officer must record it, and it costs nothing.' },
];

// ---- Nearby help ----
export const nearbyOptions = ['Police', 'Hospitals', 'Support'] as const;
export const placesByCat: Record<string, { icon: IconName; name: string; meta: string }[]> = {
  Police: [
    { icon: 'shield', name: 'Indiranagar Police Station', meta: '600 m · open 24h · 3 women officers on duty' },
    { icon: 'shield', name: 'Halasuru Gate Station', meta: '2.1 km · open 24h' },
    { icon: 'siren', name: 'Patrol vehicle KA-01-9922', meta: '340 m · moving this way' },
  ],
  Hospitals: [
    { icon: 'heart', name: 'Manipal Hospital', meta: '1.2 km · emergency ward open' },
    { icon: 'heart', name: 'Cloudnine Clinic', meta: '800 m · closes 23:00' },
  ],
  Support: [
    { icon: 'users', name: 'Vimochana Women’s Centre', meta: '2.4 km · counselling, legal aid' },
    { icon: 'message-circle', name: 'Sakhi Helpline 181', meta: 'Always open · 11 languages' },
    { icon: 'house', name: 'Parihar Short-stay Home', meta: '3.6 km · safe overnight stay' },
  ],
};

// ---- Report ----
export const reportSteps = ['Type', 'Details', 'Sent'];
export const reportTypes = ['Harassment', 'Stalking', 'Theft', 'Assault', 'Suspicious person', 'Unsafe spot'];

// ---- Fake call ----
export const delayOptions = ['Now', '10 s', '1 min'] as const;
export const fakeOpts: { title: string; sub: string; on: boolean }[] = [
  { title: 'Play a voice on answer', sub: 'A recorded "Where are you? I am outside."', on: true },
  { title: 'Use my default ringtone', sub: 'Sounds exactly like a real call', on: true },
  { title: 'Send my location too', sub: 'Quietly, to Priya', on: false },
];

// ---- Incident timeline ----
export const incidentTl: TimelineRow[] = [
  { icon: 'siren', tone: 'alert', title: 'SOS fired · voice phrase', place: '12th Main, Indiranagar', time: '21:31' },
  { icon: 'mic', tone: 'alert', title: 'Audio and video recording started', place: 'On device', time: '21:31' },
  { icon: 'users', tone: 'caution', title: 'Priya, Nikhil and Amma alerted', place: 'SMS, call, push', time: '21:31' },
  { icon: 'phone-call', tone: 'safe', title: 'Priya answered and called you', place: '38 s response', time: '21:32' },
  { icon: 'shield', tone: 'caution', title: 'Control room received the case', place: 'Bengaluru city ops', time: '21:32' },
  { icon: 'navigation', tone: 'safe', title: 'Patrol 12 reached you', place: '12th Main', time: '21:35' },
  { icon: 'check', tone: 'safe', title: 'You marked yourself safe', place: 'Home', time: '21:47' },
];

// ---- Armed (SOS) ----
export const armedChips = [
  { dot: '#17A86E', label: 'Location live' },
  { dot: '#FF4A3C', label: 'Recording' },
  { dot: '#F2A33C', label: 'Police notified' },
];

// ---- Real geo coordinates (Indiranagar, Bengaluru) for react-native-maps ----
export const geo = {
  region: { latitude: 12.9719, longitude: 77.6412, latitudeDelta: 0.012, longitudeDelta: 0.012 },
  markers: [
    { id: 'you', name: 'Meera R', label: 'You', tone: 'coral' as Tone, latitude: 12.9722, longitude: 77.6405 },
    { id: 'priya', name: 'Priya S', label: 'Priya S', tone: 'moss' as Tone, latitude: 12.9735, longitude: 77.6388 },
    { id: 'home', name: 'Home', label: 'Home', tone: 'lilac' as Tone, latitude: 12.9702, longitude: 77.6435 },
  ],
  route: [
    { latitude: 12.9722, longitude: 77.6405 },
    { latitude: 12.9715, longitude: 77.6418 },
    { latitude: 12.9708, longitude: 77.6428 },
    { latitude: 12.9702, longitude: 77.6435 },
  ],
  safeZone: { center: { latitude: 12.9719, longitude: 77.6412 }, radius: 260 },
};

// ---- Map pin positions (percentage within MapCanvas) ----
export type Pin = { name: string; tone: Tone; size: number; label?: string; left: Pct; top: Pct };
export const pins: { live: Pin[]; map: Pin[]; route: Pin[]; zone: Pin[] } = {
  live: [
    { name: 'Meera R', tone: 'coral' as Tone, size: 52, left: '46%', top: '54%' },
    { name: 'Priya S', tone: 'moss' as Tone, size: 40, left: '20%', top: '68%' },
  ],
  map: [
    { name: 'Meera R', tone: 'coral' as Tone, size: 56, label: 'You', left: '44%', top: '42%' },
    { name: 'Priya S', tone: 'moss' as Tone, size: 42, left: '20%', top: '24%' },
    { name: 'Home', tone: 'lilac' as Tone, size: 42, label: 'Home', left: '70%', top: '62%' },
  ],
  route: [
    { name: 'Meera R', tone: 'coral' as Tone, size: 40, left: '18%', top: '58%' },
    { name: 'Home', tone: 'lilac' as Tone, size: 40, left: '74%', top: '26%' },
  ],
  zone: [{ name: 'Meera R', tone: 'coral' as Tone, size: 42, left: '48%', top: '56%' }],
};
