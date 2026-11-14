import React from 'react';
import { Pressable, View } from 'react-native';
import { Btn, Card, Icon, IconDisc, PAD, PlantPhoto, Screen, SectionTitle, Toggle, TopBar, Txt, useToast } from '../components/ui';
import { careMeta } from '../components/care';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { ensurePermission, sendTest } from '../notifications';
import { CareType, nextDue, diffDays } from '../logic';

const TYPES: { key: CareType; title: string; sub: string }[] = [
  { key: 'water', title: 'Watering', sub: 'Stay on top of watering days' },
  { key: 'rotate', title: 'Sunlight', sub: 'Rotation & light checks' },
  { key: 'fertilize', title: 'Fertilizing', sub: 'Remember feeding days' },
  { key: 'mist', title: 'Misting', sub: 'Humidity boosts' },
];

export default function RemindersScreen({ navigation }: any) {
  const { c } = useTheme();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const s = state.settings;
  const meta = careMeta(c);
  const next = (id: string) => {
    const p = state.plants.find((x) => x.id === id)!;
    const dates = p.care.filter((i) => s.types[i.type]).map((i) => diffDays(nextDue(i), new Date()));
    if (!dates.length) return 'No active reminder types';
    const d = Math.min(...dates);
    return d <= 0 ? 'Due today' : d === 1 ? 'Tomorrow' : `In ${d} days`;
  };
  return (
    <Screen>
      <TopBar title="Reminders" onBack={() => navigation.goBack()} navigation={navigation} />
      <Card style={{ marginHorizontal: PAD, marginTop: 8, padding: 0 }}>
        <Row icon="bell-outline" title="All reminders" sub="Master reminder setting" value={s.push}
          onChange={async (v) => { if (v && !(await ensurePermission())) { toast('Allow notifications in Settings to get reminders', 'bell-off-outline'); return; } dispatch({ t: 'settings', patch: { push: v } }); }} />
        {TYPES.map((t, i) => (
          <Row key={t.key} icon={meta[t.key].icon} title={t.title} sub={t.sub} value={s.types[t.key] !== false} last={i === TYPES.length - 1} disabled={!s.push}
            onChange={(v) => dispatch({ t: 'settings', patch: { types: { ...s.types, [t.key]: v } } })} />
        ))}
      </Card>

      <SectionTitle title="Plants to remind you about" count={state.plants.length} />
      {state.plants.map((p) => (
        <Card key={p.id} style={{ marginHorizontal: PAD, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
          <PlantPhoto uri={p.image} style={{ width: 48, height: 48 }} rounded={12} />
          <View style={{ flex: 1 }}>
            <Txt v="label">{p.name}</Txt>
            <Txt v="bodySm" color={c.muted}>{!s.push ? 'Reminders paused' : p.muted ? 'Muted' : next(p.id)}</Txt>
          </View>
          <Toggle value={!p.muted} onChange={() => dispatch({ t: 'toggleMute', id: p.id })} />
        </Card>
      ))}

      <View style={{ paddingHorizontal: PAD, marginTop: 12, gap: 8 }}>
        <Btn label="Send a test reminder" icon="bell-ring-outline" variant="secondary" onPress={async () => { const ok = await sendTest(); toast(ok ? 'Test reminder on its way' : 'Notifications are not allowed', ok ? 'bell-ring-outline' : 'bell-off-outline'); }} />
        <Txt v="bodySm" color={c.faint} style={{ textAlign: 'center' }}>Reminders arrive once a day at 9:00 (outside your quiet hours). Change timing rules under Profile.</Txt>
      </View>
    </Screen>
  );
}

function Row({ icon, title, sub, value, onChange, last, disabled }: { icon: string; title: string; sub: string; value: boolean; onChange: (v: boolean) => void; last?: boolean; disabled?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.divider, opacity: disabled ? 0.5 : 1 }}>
      <IconDisc name={icon} bg={c.mint} color={c.primary} size={40} />
      <View style={{ flex: 1 }}><Txt v="label">{title}</Txt><Txt v="bodySm" color={c.muted}>{sub}</Txt></View>
      <Toggle value={value} onChange={(v) => { if (!disabled) onChange(v); }} />
    </View>
  );
}
