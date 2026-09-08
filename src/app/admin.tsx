import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MapCanvas } from '@/components/app/MapCanvas';
import { MapPin } from '@/components/app/MapPin';
import { TimelineItem } from '@/components/app/TimelineItem';
import { Avatar } from '@/components/core/Avatar';
import { Button } from '@/components/core/Button';
import { Icon } from '@/components/core/Icon';
import { IconButton } from '@/components/core/IconButton';
import { StatusPill } from '@/components/core/StatusPill';
import { Badge } from '@/components/core/Badge';
import {
  adminEvidence,
  adminGuardians,
  adminIncidents,
  adminTl,
  hourBars,
  kpis,
  navItems,
} from '@/data/admin';
import { colors, figtree } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function AdminScreen() {
  const router = useRouter();
  const [view, setView] = useState<'overview' | 'incident'>('overview');

  return (
    <View style={styles.root}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.brand}>
          <Text style={styles.brandName}>sakhi</Text>
          <Text style={styles.brandTag}>OPS</Text>
        </View>
        <View style={{ gap: 2 }}>
          {navItems.map((n, i) => {
            const active = (i === 0 && view === 'overview') || (i === 1 && view === 'incident');
            return (
              <Pressable key={i} onPress={() => setView(n.key)} style={[styles.nav, active && styles.navActive]}>
                <Icon name={n.icon} size={18} color={active ? colors.white : colors.ink300} />
                <Text style={[styles.navLabel, { color: active ? colors.white : colors.ink300 }]}>{n.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.sysCard}>
          <Text style={styles.sysLabel}>SYSTEM</Text>
          <View style={styles.sysRow}>
            <View style={styles.sysDot} />
            <Text style={styles.sysText}>All services healthy</Text>
          </View>
          <Text style={styles.sysMuted}>AI inference 41 ms p95</Text>
        </View>
        <Pressable onPress={() => router.replace('/(tabs)/live')} style={styles.exit}>
          <Icon name="chevron-left" size={16} color={colors.ink300} />
          <Text style={styles.exitText}>Back to app</Text>
        </Pressable>
      </View>

      {/* Main */}
      <ScrollView style={styles.main} contentContainerStyle={{ padding: 28 }}>
        {view === 'overview' ? <Overview onOpen={() => setView('incident')} /> : <Incident onBack={() => setView('overview')} />}
      </ScrollView>
    </View>
  );
}

function Overview({ onOpen }: { onOpen: () => void }) {
  return (
    <View style={{ gap: 22 }}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Live operations</Text>
          <Text style={styles.h1sub}>Bengaluru city · Tuesday 10 Feb, 21:38</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button variant="secondary" icon="share">Export shift report</Button>
          <Button variant="danger" icon="siren">Broadcast alert</Button>
        </View>
      </View>

      <View style={styles.kpiRow}>
        {kpis.map((k) => (
          <View key={k.label} style={styles.kpi}>
            <Text style={styles.kpiLabel}>{k.label}</Text>
            <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
            <Text style={styles.kpiNote}>{k.note}</Text>
          </View>
        ))}
      </View>

      <View style={styles.twoCol}>
        <View style={[styles.panel, { flex: 1.35 }]}>
          <View style={styles.panelHead}>
            <Text style={styles.panelTitle}>Open incidents</Text>
            <StatusPill tone="alert" label="3 need a responder" filled />
          </View>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { flex: 1.1 }]}>User</Text>
            <Text style={[styles.th, { flex: 1 }]}>Signal</Text>
            <Text style={[styles.th, { flex: 0.9 }]}>Location</Text>
            <Text style={[styles.th, { flex: 0.8 }]}>Status</Text>
          </View>
          {adminIncidents.map((i) => (
            <Pressable key={i.id} onPress={onOpen} style={styles.tr}>
              <View style={{ flex: 1.1 }}>
                <Text style={styles.trUser}>{i.user}</Text>
                <Text style={styles.trMeta}>{i.id} · {i.time}</Text>
              </View>
              <Text style={[styles.trCell, { flex: 1 }]}>{i.signal}</Text>
              <Text style={[styles.trCell, { flex: 0.9, color: colors.ink600 }]}>{i.place}</Text>
              <View style={{ flex: 0.8 }}>
                <View style={[styles.statusChip, { backgroundColor: i.bg }]}>
                  <Text style={[styles.statusText, { color: i.fg }]}>{i.status}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={{ flex: 1, gap: 14 }}>
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { marginBottom: 12 }]}>Crime hotspots · tonight</Text>
            <MapCanvas style={styles.adminMap}>
              <View style={[styles.hotBlob, { left: '18%', top: '24%', width: 96, height: 80, backgroundColor: 'rgba(255,74,60,.32)', borderColor: 'rgba(255,74,60,.55)' }]} />
              <View style={[styles.hotBlob, { right: '16%', top: '18%', width: 74, height: 64, backgroundColor: 'rgba(242,163,60,.32)', borderColor: 'rgba(242,163,60,.55)' }]} />
              <MapPin name="SOS" tone="coral" size={38} left="26%" top="34%" />
              <MapPin name="SOS" tone="coral" size={38} left="58%" top="62%" />
            </MapCanvas>
          </View>
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { marginBottom: 14 }]}>Alerts by hour</Text>
            <View style={styles.bars}>
              {hourBars.map((b) => (
                <View key={b.label} style={styles.barCol}>
                  <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <View style={{ height: `${b.h}%`, backgroundColor: b.hot ? colors.coral500 : colors.ink200, borderRadius: 6 }} />
                  </View>
                  <Text style={styles.barLabel}>{b.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Incident({ onBack }: { onBack: () => void }) {
  return (
    <View style={{ gap: 20 }}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconButton icon="chevron-left" variant="solid" onPress={onBack} />
          <View>
            <Text style={styles.h2}>Incident SK-4471</Text>
            <Text style={styles.h1sub}>SOS · voice phrase “help me” · 21:31</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button variant="secondary" icon="phone">Call user</Button>
          <Button variant="primary" icon="navigation">Dispatch patrol 12</Button>
        </View>
      </View>

      <View style={styles.twoCol}>
        <View style={{ flex: 1, gap: 14 }}>
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { marginBottom: 14 }]}>Live position</Text>
            <MapCanvas route style={styles.adminMap}>
              <MapPin name="A K" tone="coral" size={48} label="Anjali K" left="42%" top="46%" />
              <MapPin name="P12" tone="ink" size={40} label="Patrol 12" left="68%" top="24%" />
            </MapCanvas>
            <View style={styles.badgeRow}>
              <Badge tone="alert">Moving · 6 km/h</Badge>
              <Badge tone="neutral">GPS ±4 m</Badge>
              <Badge tone="caution">Battery 22%</Badge>
            </View>
          </View>
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { marginBottom: 14 }]}>Sealed evidence</Text>
            <View style={styles.evRow}>
              {adminEvidence.map((e) => (
                <View key={e.label} style={styles.evTile}>
                  <Icon name={e.icon} size={22} color={colors.ink600} />
                  <Text style={styles.evLabel}>{e.label}</Text>
                  <Text style={styles.evMeta}>{e.meta}</Text>
                </View>
              ))}
            </View>
            <View style={styles.lockRow}>
              <Icon name="lock" size={16} color={colors.ink500} />
              <Text style={styles.lockText}>Opening a file writes an audit entry and notifies the user.</Text>
            </View>
          </View>
        </View>

        <View style={{ flex: 1.15, gap: 14 }}>
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { marginBottom: 14 }]}>Timeline</Text>
            {adminTl.map((t, i) => (
              <TimelineItem key={i} {...t} last={i === adminTl.length - 1} />
            ))}
          </View>
          <View style={styles.panel}>
            <Text style={[styles.panelTitle, { marginBottom: 12 }]}>Guardians reached</Text>
            {adminGuardians.map((g, i) => (
              <View key={g.title} style={[styles.gRow, i < adminGuardians.length - 1 && styles.gDivider]}>
                <Avatar name={g.title} tone={g.tone} size="md" />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.gTitle}>{g.title}</Text>
                  <Text style={styles.gSub}>{g.sub}</Text>
                </View>
                <StatusPill tone={g.pillTone} label={g.pill} filled />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.ink050 },
  sidebar: { width: 232, backgroundColor: colors.ink900, paddingVertical: 22, paddingHorizontal: 16, gap: 26 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8 },
  brandName: { fontFamily: figtree(800), fontSize: 22, color: colors.white, letterSpacing: -0.045 * 22 },
  brandTag: { fontFamily: figtree(700), fontSize: 11, letterSpacing: 1, color: colors.ink400 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 12 },
  navActive: { backgroundColor: colors.ink800 },
  navLabel: { fontFamily: figtree(600), fontSize: 15 },
  sysCard: { marginTop: 'auto', backgroundColor: colors.ink800, borderRadius: 14, padding: 14, gap: 6 },
  sysLabel: { fontFamily: figtree(700), fontSize: 12, letterSpacing: 1, color: colors.ink400 },
  sysRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sysDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.moss500 },
  sysText: { fontFamily: figtree(500), fontSize: 14, color: colors.white },
  sysMuted: { fontFamily: figtree(400), fontSize: 13, color: colors.ink400 },
  exit: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12 },
  exitText: { fontFamily: figtree(600), fontSize: 13, color: colors.ink300 },
  main: { flex: 1 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  h1: { fontFamily: figtree(800), fontSize: 32, letterSpacing: -0.028 * 32, color: colors.ink900 },
  h2: { fontFamily: figtree(800), fontSize: 28, letterSpacing: -0.028 * 28, color: colors.ink900 },
  h1sub: { fontFamily: figtree(400), fontSize: 15, color: colors.ink500, marginTop: 2 },

  kpiRow: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  kpi: { flex: 1, minWidth: 180, backgroundColor: colors.white, borderRadius: 18, padding: 18, gap: 8, ...cardShadow },
  kpiLabel: { fontFamily: figtree(700), fontSize: 13, letterSpacing: 1.17, textTransform: 'uppercase', color: colors.ink500 },
  kpiValue: { fontFamily: figtree(800), fontSize: 34, letterSpacing: -0.03 * 34 },
  kpiNote: { fontFamily: figtree(400), fontSize: 13, color: colors.ink500 },

  twoCol: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' },
  panel: { backgroundColor: colors.white, borderRadius: 18, padding: 18, minWidth: 320, ...cardShadow },
  panelHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  panelTitle: { fontFamily: figtree(800), fontSize: 21, letterSpacing: -0.024 * 21, color: colors.ink900 },

  tableHead: { flexDirection: 'row', gap: 8, paddingHorizontal: 8, paddingBottom: 10 },
  th: { fontFamily: figtree(700), fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.ink400 },
  tr: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: colors.ink100 },
  trUser: { fontFamily: figtree(700), fontSize: 14, color: colors.ink900 },
  trMeta: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 12, color: colors.ink400 },
  trCell: { fontFamily: figtree(400), fontSize: 14, color: colors.ink900 },
  statusChip: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 5, paddingHorizontal: 11 },
  statusText: { fontFamily: figtree(700), fontSize: 13 },

  adminMap: { height: 220, borderRadius: 14 },
  hotBlob: { position: 'absolute', borderRadius: 999, borderWidth: 1 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 96 },
  barCol: { flex: 1, height: '100%', gap: 6 },
  barLabel: { fontFamily: figtree(400), fontSize: 10, color: colors.ink400, textAlign: 'center' },

  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  evRow: { flexDirection: 'row', gap: 10 },
  evTile: { flex: 1, backgroundColor: colors.ink050, borderRadius: 14, height: 96, alignItems: 'center', justifyContent: 'center', gap: 8 },
  evLabel: { fontFamily: figtree(600), fontSize: 13, color: colors.ink700 },
  evMeta: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 11, color: colors.ink400 },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  lockText: { flex: 1, fontFamily: figtree(400), fontSize: 13, color: colors.ink500 },

  gRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  gDivider: { borderBottomWidth: 1, borderBottomColor: colors.ink100 },
  gTitle: { fontFamily: figtree(700), fontSize: 15, color: colors.ink900 },
  gSub: { fontFamily: figtree(400), fontSize: 13, color: colors.ink500, marginTop: 2 },
});
