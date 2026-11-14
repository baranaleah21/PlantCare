import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Btn, Card, Empty, Icon, IconDisc, PAD, PlantPhoto, Screen, Segmented, Tag, TopBar, Txt, useToast } from '../components/ui';
import { careMeta, taskLabel } from '../components/care';
import { fonts, radius, useTheme } from '../theme';
import { useStore } from '../store';
import { addDays, CareType, diffDays, isSameDay, LogType, monthGrid, startOfDay, tasksFor } from '../logic';

type View_ = 'day' | 'week' | 'month';
const season = (m: number) => (m <= 1 || m === 11 ? 'Winter Care' : m <= 4 ? 'Spring Growth' : m <= 7 ? 'Summer Care' : 'Autumn Care');
const mondayOf = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));

export default function CalendarScreen({ navigation }: any) {
  const { c } = useTheme();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [mode, setMode] = useState<View_>('month');
  const [sel, setSel] = useState(startOfDay(new Date()));
  const now = new Date();
  const today = startOfDay(now);
  const meta = careMeta(c);
  const dot: Record<LogType, string> = { water: c.water, mist: c.water, rotate: c.sun, fertilize: c.healthy, repot: c.soil, prune: c.soil };

  const typesOn = (d: Date): LogType[] => {
    const delta = diffDays(d, today);
    const set = new Set<LogType>();
    if (delta >= 0) tasksFor(state.plants, d, now).forEach((t) => set.add(t.type));
    if (delta <= 0) state.logs.forEach((l) => { if (isSameDay(l.date, d)) set.add(l.type); });
    return Array.from(set);
  };

  const move = (dir: 1 | -1) => {
    if (mode === 'month') setSel(new Date(sel.getFullYear(), sel.getMonth() + dir, 1));
    else if (mode === 'week') setSel(addDays(sel, 7 * dir));
    else setSel(addDays(sel, dir));
  };
  const title = mode === 'month' ? sel.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : mode === 'week' ? `${mondayOf(sel).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${addDays(mondayOf(sel), 6).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
    : sel.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const pendingToday = tasksFor(state.plants, today, now).length;
  const rows = mode === 'month' ? monthGrid(sel.getFullYear(), sel.getMonth()) : mode === 'week' ? [Array.from({ length: 7 }, (_, i) => addDays(mondayOf(sel), i))] : [];

  const dayTasks = useMemo(() => (diffDays(sel, today) >= 0 ? tasksFor(state.plants, sel, now) : []), [state.plants, sel]);
  const dayLogs = useMemo(() => (diffDays(sel, today) <= 0 ? state.logs.filter((l) => isSameDay(l.date, sel) && state.plants.some((p) => p.id === l.plantId)) : []), [state.logs, state.plants, sel]);
  const tomorrow = useMemo(() => tasksFor(state.plants, addDays(today, 1), now), [state.plants]);
  const isToday = isSameDay(sel, today);
  const plantOf = (id: string) => state.plants.find((p) => p.id === id)!;
  const heading = isToday ? 'Scheduled for Today' : diffDays(sel, today) < 0 ? 'Completed' : 'Scheduled';

  const taskCard = (key: string, plantId: string, type: LogType, sub: string, action: React.ReactNode) => {
    const p = plantOf(plantId); const m = meta[type];
    return (
      <Card key={key} onPress={() => navigation.navigate('PlantDetail', { id: plantId })} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginHorizontal: PAD, marginBottom: 10, padding: 12 }}>
        <PlantPhoto uri={p.image} style={{ width: 64, height: 64 }} rounded={12} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconDisc name={m.icon} bg={m.bg} color={m.fg} size={28} />
            <Txt v="label" numberOfLines={1} style={{ flex: 1, fontFamily: fonts.bold }}>{p.name}</Txt>
          </View>
          <Txt v="bodySm" color={c.muted} numberOfLines={2}>{sub}</Txt>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><Icon name="home-outline" size={13} color={c.faint} /><Txt v="micro" color={c.faint}>{p.room}</Txt></View>
        </View>
        {action}
      </Card>
    );
  };

  return (
    <Screen>
      <TopBar title="Calendar" navigation={navigation} />
      <View style={{ paddingHorizontal: PAD, marginTop: 4 }}>
        <Segmented<View_> options={[{ key: 'day', label: 'Day' }, { key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }]} value={mode} onChange={setMode} />
      </View>

      <Card style={{ marginHorizontal: PAD, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
        <IconDisc name="calendar-month-outline" bg={c.mint} color={c.primary} size={44} />
        <View style={{ flex: 1 }}>
          <Txt v="h3" numberOfLines={1}>{title}</Txt>
          <Txt v="bodySm" color={c.muted}>{pendingToday} pending ritual{pendingToday === 1 ? '' : 's'} today</Txt>
        </View>
        <Tag tone="green" label={season(sel.getMonth())} />
        <Pressable onPress={() => move(-1)} hitSlop={10} accessibilityLabel="Previous"><Icon name="chevron-left" size={26} /></Pressable>
        <Pressable onPress={() => move(1)} hitSlop={10} accessibilityLabel="Next"><Icon name="chevron-right" size={26} /></Pressable>
      </Card>

      {mode !== 'day' ? (
        <Card style={{ marginHorizontal: PAD, marginTop: 14, padding: 12 }}>
          <View style={{ flexDirection: 'row' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <Txt key={i} v="labelSm" color={c.muted} style={{ flex: 1, textAlign: 'center', paddingVertical: 6 }}>{d}</Txt>)}
          </View>
          {rows.map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row' }}>
              {row.map((d, ci) => {
                if (!d) return <View key={ci} style={{ flex: 1, height: 52 }} />;
                const inMonth = mode === 'week' || d.getMonth() === sel.getMonth();
                const on = isSameDay(d, sel);
                const isT = isSameDay(d, today);
                const types = inMonth ? typesOn(d).slice(0, 3) : [];
                return (
                  <Pressable key={ci} onPress={() => setSel(startOfDay(d))} accessibilityLabel={d.toDateString()} style={{ flex: 1, height: 52, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 40, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.primary : 'transparent', borderWidth: isT && !on ? 1.5 : 0, borderColor: c.primary }}>
                      <Txt v="body" color={on ? '#fff' : inMonth ? c.text : c.faint} style={{ fontFamily: on || isT ? fonts.bold : fonts.reg, opacity: inMonth ? 1 : 0.5 }}>{d.getDate()}</Txt>
                      <View style={{ flexDirection: 'row', gap: 2, height: 6, marginTop: 1 }}>
                        {types.map((t) => <View key={t} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: dot[t] }} />)}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', backgroundColor: c.surfaceLow, borderRadius: radius.md, padding: 10, marginTop: 8 }}>
            {[['Water', c.water], ['Sunlight', c.sun], ['Fertilize', c.healthy], ['Repot / Prune', c.soil]].map(([l, col]) => (
              <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: col }} /><Txt v="micro" color={c.muted}>{l}</Txt></View>
            ))}
          </View>
        </Card>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: PAD, marginTop: 24, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexShrink: 1 }}><Icon name="sprout-outline" size={22} color={c.accent} /><Txt v="h2" numberOfLines={1}>{heading}</Txt></View>
        <Tag tone="green" label={sel.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} />
      </View>

      {dayTasks.length === 0 && dayLogs.length === 0 ? <Empty title="Nothing on this day" sub="A quiet day for your plants. Enjoy it." /> : null}
      {dayTasks.map((t) => taskCard(t.plantId + t.type, t.plantId, t.type, taskLabel(t.type, plantOf(t.plantId), state.settings.units),
        isToday
          ? <Btn small icon="check" label="Done" onPress={() => { dispatch({ t: 'complete', plantId: t.plantId, type: t.type }); toast(`${plantOf(t.plantId).name}: done`, 'check-circle-outline'); }} />
          : <Tag label={diffDays(sel, today) === 1 ? 'Tomorrow' : 'Upcoming'} />))}
      {dayLogs.map((l) => taskCard(l.id, l.plantId, l.type, `${meta[l.type].label} • ${new Date(l.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`, <Icon name="check-circle" size={26} color={c.healthy} />))}

      {isToday ? (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: PAD, marginTop: 20, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Icon name="weather-sunset-up" size={22} color={c.accent} /><Txt v="h2">Upcoming Tomorrow</Txt></View>
            <Txt v="bodySm" color={c.muted}>{addDays(today, 1).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</Txt>
          </View>
          {tomorrow.length === 0 ? <Card style={{ marginHorizontal: PAD }}><Txt v="bodySm" color={c.muted}>Nothing scheduled for tomorrow.</Txt></Card> : null}
          {tomorrow.map((t) => taskCard('tm' + t.plantId + t.type, t.plantId, t.type, taskLabel(t.type, plantOf(t.plantId), state.settings.units), <Tag label="Tomorrow" />))}
        </>
      ) : null}

      <Card style={{ marginHorizontal: PAD, marginTop: 20, flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: c.surfaceLow }}>
        <IconDisc name="sprout-outline" bg={c.mint} color={c.primary} size={44} />
        <View style={{ flex: 1 }}>
          <Txt v="label">Care Rhythm Note</Txt>
          <Txt v="bodySm" color={c.muted}>Cooler mornings mean slower growth. Always check soil moisture 2 inches deep before watering.</Txt>
        </View>
      </Card>
    </Screen>
  );
}
