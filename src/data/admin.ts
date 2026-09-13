// Admin (control-room) navigation config. The control-room has no backend yet,
// so admin.tsx renders honest empty states; only the static nav lives here.
import { IconName } from '@/components/core/Icon';

export const navItems: { key: 'overview' | 'incident'; label: string; icon: IconName }[] = [
  { key: 'overview', label: 'Live ops', icon: 'activity' },
  { key: 'incident', label: 'Incidents', icon: 'siren' },
  { key: 'overview', label: 'Hotspots', icon: 'layers' },
  { key: 'overview', label: 'Users', icon: 'users' },
  { key: 'overview', label: 'Reports', icon: 'triangle-alert' },
  { key: 'overview', label: 'Settings', icon: 'settings' },
];
