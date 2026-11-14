import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, View } from 'react-native';
import { Btn, Card, Chip, Empty, Field, Icon, IconDisc, PAD, PlantPhoto, ProgressBar, Screen, Sheet, Tag, TopBar, Txt, useToast } from '../components/ui';
import { careMeta } from '../components/care';
import { confirmAction } from '../components/dialog';
import { fonts, radius, useTheme } from '../theme';
import { useStore } from '../store';
import { CARE_LABEL, consistency, describeLog, diffDays, LogType, startOfDay, streak, toCsv } from '../logic';

const FILTERS: { key: 'all' | LogType; label: string }[] = [
  { key: 'all', label: 'All History' }, { key: 'water', label: 'Watering' }, { key: 'fertilize', label: 'Fertilizing' },
  { key: 'mist', label: 'Misting' }, { key: 'rotate', label: 'Rotating' }, { key: 'repot', label: 'Repotting' }, { key: 'prune', label: 'Pruning' },
];

export default function HistoryScreen({ navigation, route }: any) {
  const { c } = useTheme();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [f, setF] = useState<'all' | LogType>('all');
  const [limit, setLimit] = useState(30);
  const [insights, setInsights] = useState(false);
  const meta = careMeta(c);
  const plantFilter: string | undefined = route?.params?.plantId;
  const filterPlant = state.plants.find((p) => p.id === plantFilter);
  const now = new Date();

  const logs = useMemo(() => {
    const t = q.trim().toLowerCase();
    return state.logs
      .filter((l) => state.plants.some((p) => p.id === l.plantId))
      .filter((l) => (plantFilter ? l.plantId === plantFilter : true))
      .filter((l) => (f === 'all' ? true : l.type === f))
      .filter((l) => {
        if (!t) return true;
        const p = state.plants.find((x) => x.id === l.plantId)!;
        return (p.name + ' ' + p.room + ' ' + CARE_LABEL[l.type] + ' ' + (l.note ?? '')).toLowerCase().includes(t);
      })
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [state.logs, state.plants, q, f, plantFilter]);

  const groups = useMemo(() => {
    const m = new Map<number, typeof logs>();
    logs.slice(0, limit).forEach((l) => { const k = startOfDay(l.date).getTime(); m.set(k, [...(m.get(k) ?? []), l]); });
    return Array.from(m.entries());
  }, [logs, limit]);

  const st = streak(state.logs, now);
  const cons = consistency(state.logs, now);
  const dayLabel = (ts: number) => { const d = diffDays(now, ts); return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : new Date(ts).toLocaleDateString(undefined, { weekday: 'long' }); };
  const byType = (['water', 'fertilize', 'mist', 'rotate', 'repot', 'prune'] as LogType[]).map((t) => ({ t, n: state.logs.filter((l) => l.type === t).length }));
  const maxN = Math.max(1, ...byType.map((x) => x.n));

  const exportCsv = async () => { try { await Share.share({ title: 'PlantCare history', message: toCsv(state.logs, state.plants) }); } catch {} };
  const shareStreak = async () => { try { await Share.share({ message: `🌿 ${st}-day care streak and ${cons}% consistency this month on PlantCare!` }); } catch {} };

  return (
    <Screen>
      <TopBar title="History" navigation={navigation} />
      <View style={{ paddingHorizontal: PAD, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <View style={{ flex: 1 }}>
          <Txt v="h1">Care History</Txt>
          <Txt v="bodySm" color={c.muted}>{state.logs.length} mindful care rituals logged</Txt>
        </View>
        <Pressable onPress={exportCsv} accessibilityLabel="Share history"><IconDisc name="export-variant" bg={c.mint} color={c.primary} size={48} /></Pressable>
      </View>

      <View style={{ paddingHorizontal: PAD, marginTop: 16 }}>
        <Field icon="magnify" placeholder="Search history records..." value={q} onChangeText={setQ} rightIcon={q ? 'close-circle' : undefined} onRight={() => setQ('')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: PAD, gap: 8, paddingVertical: 14 }}>
        {filterPlant ? <Chip label={filterPlant.name} icon="close" selected onPress={() => navigation.setParams({ plantId: undefined })} /> : null}
        {FILTERS.map((x) => <Chip key={x.key} label={x.label} selected={f === x.key} onPress={() => { setF(x.key); setLimit(30); }} />)}
      </ScrollView>

      {groups.length === 0 ? <Empty icon="history" title="No rituals found" sub="Complete a care task and it will show up here." /> : null}
      {groups.map(([ts, items]) => (
        <View key={ts} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD, marginVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Txt v="h2">{dayLabel(ts)}</Txt>
              <Txt v="bodySm" color={c.muted}>{new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Txt>
            </View>
            <Tag tone={diffDays(now, ts) === 0 ? 'green' : 'neutral'} label={`${items.length} ritual${items.length === 1 ? '' : 's'}`} />
          </View>
          {items.map((l) => {
            const p = state.plants.find((x) => x.id === l.plantId)!;
            const m = meta[l.type];
            return (
              <Card key={l.id} onPress={() => navigation.navigate('PlantDetail', { id: p.id })} style={{ marginHorizontal: PAD, marginBottom: 10, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <IconDisc name={m.icon} bg={m.bg} color={m.fg} size={44} />
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                    <Txt v="label" style={{ flex: 1, fontFamily: fonts.bold }}>{describeLog(l, p, state.settings.units)}</Txt>
                    <Txt v="micro" color={c.muted}>{new Date(l.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</Txt>
                  </View>
                  <Txt v="bodySm" color={c.muted}>{p.name} • <Txt v="bodySm" color={c.accent}>{p.room}</Txt></Txt>
                  {l.note ? <Tag tone={l.type === 'repot' ? 'amber' : 'neutral'} icon={l.type === 'repot' ? 'plus-circle-outline' : 'note-text-outline'} label={l.note} /> : null}
                  <Pressable onPress={() => confirmAction('Remove this entry?', undefined, 'Remove', () => { dispatch({ t: 'deleteLog', id: l.id }); toast('Entry removed', 'trash-can-outline'); })} hitSlop={8} style={{ alignSelf: 'flex-start', marginTop: 2 }}>
                    <Txt v="micro" color={c.faint}>Remove</Txt>
                  </Pressable>
                </View>
                <PlantPhoto uri={p.image} style={{ width: 52, height: 52 }} rounded={10} />
              </Card>
            );
          })}
        </View>
      ))}
      {logs.length > limit ? <View style={{ paddingHorizontal: PAD }}><Btn label="Load more" variant="secondary" onPress={() => setLimit((n) => n + 30)} /></View> : null}

      <View style={{ marginHorizontal: PAD, marginTop: 12, backgroundColor: c.primary, borderRadius: radius.xl, padding: 18, gap: 12, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <IconDisc name="check-decagram-outline" bg="rgba(255,255,255,0.15)" color="#fff" size={44} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Txt v="micro" color="#C3EBB0" style={{ fontFamily: fonts.bold }}>MONTHLY MILESTONE</Txt>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}><Txt v="micro" color="#fff">{now.toLocaleDateString(undefined, { month: 'long' })}</Txt></View>
            </View>
            <Txt v="body" color="#fff" style={{ marginTop: 4 }}>You maintained a <Txt v="body" color="#C3EBB0" style={{ fontFamily: fonts.bold }}>{cons}% care consistency</Txt> this month{st > 1 ? ` with a ${st}-day streak` : ''}! 🌿 Keep it up.</Txt>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Btn small label="View Insights" variant="outline" onPress={() => setInsights(true)} style={{ backgroundColor: '#fff' }} />
          <Pressable onPress={shareStreak} style={{ padding: 10 }}><Txt v="label" color="#fff">Share Streak</Txt></Pressable>
        </View>
      </View>

      <Sheet visible={insights} onClose={() => setInsights(false)} title="Care Insights">
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {[[String(state.logs.length), 'Rituals'], [`${st}`, 'Day streak'], [`${cons}%`, 'This month']].map(([v, l]) => (
            <View key={l} style={{ flex: 1, backgroundColor: c.surfaceLow, borderRadius: radius.lg, padding: 14, alignItems: 'center' }}><Txt v="h1" color={c.accent}>{v}</Txt><Txt v="micro" color={c.muted}>{l}</Txt></View>
          ))}
        </View>
        <Txt v="label" style={{ marginBottom: 10 }}>Rituals by type</Txt>
        {byType.map(({ t, n }) => (
          <View key={t} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}><Txt v="bodySm">{CARE_LABEL[t]}</Txt><Txt v="labelSm" color={c.muted}>{n}</Txt></View>
            <ProgressBar pct={(n / maxN) * 100} color={meta[t].fg} />
          </View>
        ))}
      </Sheet>
    </Screen>
  );
}
