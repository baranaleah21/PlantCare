import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Btn, Card, CheckCircle, Icon, IconDisc, PAD, PlantPhoto, Ring, Screen, SectionTitle, Tag, TopBar, Txt, useToast } from '../components/ui';
import { careMeta, taskLabel, tipOfTheDay } from '../components/care';
import { useStore } from '../store';
import { fonts, radius, shadow, useTheme } from '../theme';
import { CareType, plantStatus, tasksFor } from '../logic';

export default function HomeScreen({ navigation }: any) {
  const { c } = useTheme();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const now = new Date();
  const meta = careMeta(c);
  const hour = now.getHours();
  const greet = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const first = state.user.name.split(' ')[0];

  const pending = useMemo(() => tasksFor(state.plants, now), [state.plants]);
  const doneToday = useMemo(
    () => state.logs.filter((l) => new Date(l.date).toDateString() === now.toDateString() && ['water', 'fertilize', 'mist', 'rotate'].includes(l.type) && state.plants.some((p) => p.id === l.plantId)),
    [state.logs, state.plants],
  );
  const total = pending.length + doneToday.length;
  const plantOf = (id: string) => state.plants.find((p) => p.id === id)!;

  const toggle = (plantId: string, type: CareType, done: boolean) => {
    if (done) { dispatch({ t: 'undo', plantId, type }); return; }
    dispatch({ t: 'complete', plantId, type });
    toast(`${plantOf(plantId).name}: ${meta[type].label.toLowerCase()} done`, 'check-circle-outline');
  };

  const urgent = pending.find((t) => t.type === 'water') ?? pending[0];

  const Row = ({ plantId, type, done, label }: { plantId: string; type: CareType; done: boolean; label: string }) => {
    const p = plantOf(plantId);
    const m = meta[type];
    return (
      <Card onPress={() => (done ? navigation.navigate('PlantDetail', { id: plantId }) : navigation.navigate('CareSession', { plantId, type }))}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, marginHorizontal: PAD, marginBottom: 10, backgroundColor: done ? c.surfaceLow : c.surface, ...(done ? shadow(c, 1) : {}) }}>
        <View style={{ opacity: done ? 0.5 : 1 }}><IconDisc name={m.icon} bg={m.bg} color={m.fg} size={48} /></View>
        <View style={{ flex: 1, gap: 2, opacity: done ? 0.6 : 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Txt v="label" numberOfLines={1} style={{ flexShrink: 1, fontFamily: fonts.bold, textDecorationLine: done ? 'line-through' : 'none' }}>{p.name}</Txt>
            <Tag label={p.room} />
          </View>
          <Txt v="bodySm" color={c.muted} numberOfLines={1} style={{ textDecorationLine: done ? 'line-through' : 'none' }}>{done ? `${m.label} complete` : label}</Txt>
        </View>
        <CheckCircle done={done} onPress={() => toggle(plantId, type, done)} />
      </Card>
    );
  };

  return (
    <Screen>
      <TopBar title="Home" navigation={navigation} />
      <View style={{ paddingHorizontal: PAD, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <Txt v="h1" color={c.accent} style={{ fontFamily: fonts.bold }}>{greet}, {first} 🌿</Txt>
          <Txt v="bodySm" color={c.muted}>{now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</Txt>
        </View>
        <Pressable accessibilityLabel="Open next reminder" onPress={() => (urgent ? navigation.navigate('CareSession', { plantId: urgent.plantId, type: urgent.type }) : toast('All caught up. Nothing is due.', 'leaf'))}>
          <IconDisc name="leaf" bg={c.mint} color={c.primary} size={48} />
        </Pressable>
      </View>

      <Card style={{ marginHorizontal: PAD, marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: c.mintSoft }}>
        <Ring value={doneToday.length} total={total} size={60} />
        <View style={{ flex: 1 }}>
          <Txt v="h3">{pending.length === 0 ? 'All caught up!' : `${pending.length} plant${pending.length === 1 ? '' : 's'} need love today`}</Txt>
          <Txt v="bodySm" color={c.muted}>{pending.length === 0 ? 'Your sanctuary is thriving.' : 'Mindful rituals bring flourishing leaves.'}</Txt>
        </View>
      </Card>

      <SectionTitle title="Today's Tasks" right="View All" onRight={() => navigation.navigate('Calendar')} />
      {total === 0 ? (
        <Card style={{ marginHorizontal: PAD }}><Txt v="body" color={c.muted}>Nothing scheduled today. Enjoy the calm.</Txt></Card>
      ) : null}
      {pending.map((t) => <React.Fragment key={t.plantId + t.type}>{Row({ plantId: t.plantId, type: t.type, done: false, label: taskLabel(t.type, plantOf(t.plantId), state.settings.units) })}</React.Fragment>)}
      {doneToday.map((l) => <React.Fragment key={l.id}>{Row({ plantId: l.plantId, type: l.type as CareType, done: true, label: '' })}</React.Fragment>)}

      <SectionTitle title="My Plants" count={state.plants.length} right="+ Add Plant" onRight={() => navigation.navigate('AddPlant')} />
      <FlatList
        horizontal showsHorizontalScrollIndicator={false} data={state.plants} keyExtractor={(p) => p.id}
        contentContainerStyle={{ paddingHorizontal: PAD, gap: 12, paddingBottom: 4 }}
        renderItem={({ item: p }) => {
          const s = plantStatus(p);
          return (
            <Card onPress={() => navigation.navigate('PlantDetail', { id: p.id })} style={{ width: 150, padding: 10 }}>
              <View>
                <PlantPhoto uri={p.image} style={{ width: 130, height: 130 }} />
                <Tag style={{ position: 'absolute', top: 8, left: 8 }} tone={s.status === 'healthy' ? 'green' : s.status === 'needs-water' ? 'amber' : 'coral'}
                  icon={s.status === 'healthy' ? 'check-circle-outline' : 'water-outline'} label={s.status === 'healthy' ? 'Healthy' : s.status === 'needs-water' ? 'Needs Water' : 'Low Mist'} />
              </View>
              <Txt v="h3" style={{ marginTop: 10 }} numberOfLines={1}>{p.name}</Txt>
              <Txt v="bodySm" color={c.muted} numberOfLines={1}>{p.room}</Txt>
            </Card>
          );
        }}
        ListEmptyComponent={<Btn label="Add your first plant" icon="plus" onPress={() => navigation.navigate('AddPlant')} />}
      />

      <Card style={{ marginHorizontal: PAD, marginTop: 28, flexDirection: 'row', gap: 12, backgroundColor: c.mintSoft }}>
        <IconDisc name="lightbulb-on-outline" bg={c.surface} color={c.accent} size={36} />
        <View style={{ flex: 1 }}>
          <Txt v="labelSm" color={c.accent}>Botanical Care Tip</Txt>
          <Txt v="body" style={{ marginTop: 2 }}>{tipOfTheDay()}</Txt>
        </View>
      </Card>
    </Screen>
  );
}
