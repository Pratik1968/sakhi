import { Tabs, usePathname, useRouter } from 'expo-router';
import { TabBar, TabDef } from '@/components/app/TabBar';

const TABS: TabDef[] = [
  { value: 'live', label: 'Live', icon: 'shield' },
  { value: 'map', label: 'Map', icon: 'map-pin' },
  { value: 'tools', label: 'Tools', icon: 'layers' },
  { value: 'circle', label: 'Circle', icon: 'users' },
  { value: 'you', label: 'You', icon: 'settings' },
];

// Sub-screens live in the tab group so the tab bar stays visible (Tools active).
const SUBSCREENS = ['ai', 'routes', 'zones', 'evidence', 'chatbot', 'nearby', 'report', 'fake', 'timeline', 'incident'];

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const seg = pathname.split('/').filter(Boolean).pop() ?? 'live';
  const current = TABS.some((t) => t.value === seg)
    ? seg
    : SUBSCREENS.includes(seg)
      ? 'tools'
      : 'live';

  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: 'shift' }}
      tabBar={() => (
        <TabBar tabs={TABS} value={current} onChange={(v) => router.navigate(`/${v}` as never)} />
      )}
    >
      <Tabs.Screen name="live" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="tools" />
      <Tabs.Screen name="circle" />
      <Tabs.Screen name="you" />
      {SUBSCREENS.map((name) => (
        <Tabs.Screen key={name} name={name} />
      ))}
    </Tabs>
  );
}
