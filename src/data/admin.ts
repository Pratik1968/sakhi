// Admin (control-room) dashboard data, ported from Sakhi Prototype.dc.html.
import { IconName } from '@/components/core/Icon';
import { TimelineRow } from './sakhi';

export const kpis = [
  { label: 'Open SOS', value: '3', note: '2 dispatched, 1 waiting', color: '#E23A2E' },
  { label: 'Median response', value: '2m 14s', note: '38 s faster than last week', color: '#121114' },
  { label: 'Protected users', value: '48,210', note: '+1,904 this month', color: '#121114' },
  { label: 'Reports tonight', value: '126', note: '11 verified as hotspots', color: '#121114' },
];

export type IncidentRow = {
  id: string;
  user: string;
  time: string;
  signal: string;
  place: string;
  status: string;
  bg: string;
  fg: string;
};
export const adminIncidents: IncidentRow[] = [
  { id: 'SK-4471', user: 'Anjali K.', time: '21:31', signal: 'Voice phrase', place: '12th Main', status: 'Dispatching', bg: '#FFF0EE', fg: '#B92C22' },
  { id: 'SK-4470', user: 'Reema T.', time: '21:18', signal: 'Shake trigger', place: 'HAL Road', status: 'Responder en route', bg: '#FDF3E5', fg: '#D8861F' },
  { id: 'SK-4469', user: 'Sneha M.', time: '20:54', signal: 'Off safe route', place: 'Domlur', status: 'Guardian replied', bg: '#E8F7EF', fg: '#0B6E48' },
  { id: 'SK-4468', user: 'Farah S.', time: '20:40', signal: 'Fall detected', place: 'Old Airport Rd', status: 'False alarm', bg: '#E4E2E8', fg: '#54515B' },
  { id: 'SK-4467', user: 'Divya N.', time: '20:12', signal: 'Panic button', place: 'Marathahalli', status: 'Resolved', bg: '#E8F7EF', fg: '#0B6E48' },
];

export const hourBars = [
  ['18', 20, 0], ['19', 34, 0], ['20', 52, 0], ['21', 78, 1], ['22', 96, 1], ['23', 84, 1],
  ['00', 61, 1], ['01', 40, 0], ['02', 28, 0], ['03', 18, 0], ['04', 12, 0], ['05', 22, 0],
].map(([label, v, hot]) => ({ label: label as string, h: v as number, hot: !!hot }));

export const navItems: { key: 'overview' | 'incident'; label: string; icon: IconName }[] = [
  { key: 'overview', label: 'Live ops', icon: 'activity' },
  { key: 'incident', label: 'Incidents', icon: 'siren' },
  { key: 'overview', label: 'Hotspots', icon: 'layers' },
  { key: 'overview', label: 'Users', icon: 'users' },
  { key: 'overview', label: 'Reports', icon: 'triangle-alert' },
  { key: 'overview', label: 'Settings', icon: 'settings' },
];

export const adminEvidence: { icon: IconName; label: string; meta: string }[] = [
  { icon: 'mic', label: 'Audio', meta: '04:12' },
  { icon: 'video', label: 'Video · rear', meta: '00:38' },
  { icon: 'map-pin', label: 'GPS track', meta: '412 pts' },
];

export const adminTl: TimelineRow[] = [
  { icon: 'mic', tone: 'alert', title: 'Voice phrase "help me" matched', place: 'Confidence 0.94', time: '21:31' },
  { icon: 'siren', tone: 'alert', title: 'SOS opened automatically', place: 'SK-4471', time: '21:31' },
  { icon: 'users', tone: 'caution', title: '3 guardians alerted', place: 'SMS + call', time: '21:31' },
  { icon: 'phone-call', tone: 'safe', title: 'Guardian Priya answered', place: '38 s', time: '21:32' },
  { icon: 'activity', tone: 'caution', title: 'Subject still moving away from route', place: '6 km/h north', time: '21:33' },
  { icon: 'navigation', tone: 'neutral', title: 'Patrol 12 assigned', place: 'ETA 3 min', time: '21:34' },
];

export const adminGuardians = [
  { title: 'Priya Sharma', sub: 'Answered in 38 s · on the phone now', tone: 'coral' as const, pillTone: 'safe' as const, pill: 'On call' },
  { title: 'Nikhil Rao', sub: 'Location delivered · no answer', tone: 'moss' as const, pillTone: 'caution' as const, pill: 'Ringing' },
  { title: 'Amma', sub: 'SMS with live link delivered', tone: 'ink' as const, pillTone: 'offline' as const, pill: 'SMS' },
];
