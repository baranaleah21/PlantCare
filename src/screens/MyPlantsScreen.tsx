import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Btn, Card, Chip, Empty, Field, Icon, PAD, PlantPhoto, Tag, TopBar, Txt } from '../components/ui';
import { radius, shadow, useTheme } from '../theme';
import { useStore } from '../store';
import { plantStatus } from '../logic';

export default function MyPlantsScreen({ navigation }: any) {
  const { c } = useTheme();
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [grid, setGrid] = useState(true);
  const [sortAZ, setSortAZ] = useState(false);

  const rooms = useMemo(() => Array.from(new Set(state.plants.map((p) => p.room))), [state.plants]);
  const needs = state.plants.filter((p) => plantStatus(p).status !== 'healthy');
  const list = useMemo(() => {
    let l = state.plants.filter((p) => {
      const t = q.trim().toLowerCase();
      if (t && !(p.name + p.species + p.room).toLowerCase().includes(t)) return false;
      if (filter === 'needs') return plantStatus(p).status !== 'healthy';
      if (filter === 'fav') return p.favorite;
      if (filter.startsWith('room:')) return p.room === filter.slice(5);
      return true;
    });
    if (sortAZ) l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [state.plants, q, filter, sortAZ]);

  const Item = ({ p }: { p: (typeof list)[number] }) => {
    const s = plantStatus(p);
    const tone = s.status === 'healthy' ? 'green' : s.status === 'needs-water' ? 'amber' : 'coral';
    const tagLabel = s.status === 'healthy' ? 'Healthy' : s.status === 'needs-water' ? 'Needs Water' : 'Low Mist';
    const urgent = s.status !== 'healthy';
    const photo = (
      <View>
        <PlantPhoto uri={p.image} style={grid ? { width: '100%', aspectRatio: 1 } : { width: 88, height: 88 }} />
        <Tag style={{ position: 'absolute', top: 8, left: 8 }} tone={tone} icon={urgent ? 'water-outline' : 'check-circle-outline'} label={tagLabel} />
        {p.favorite ? <View style={{ position: 'absolute', top: 8, right: 8 }}><Icon name="heart" size={18} color={c.coral} /></View> : null}
      </View>
    );
    const meta = (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surfaceLow, borderRadius: radius.md, padding: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <Icon name={urgent ? 'clock-outline' : 'calendar-blank-outline'} size={16} color={urgent ? c.amberText : c.accent} />
        <Txt v="labelSm" color={urgent ? c.amberText : c.muted}>{s.next}</Txt>
        <Txt v="micro" color={c.faint} numberOfLines={1}>{p.room}</Txt>
      </View>
    );
    return (
      <Card onPress={() => navigation.navigate('PlantDetail', { id: p.id })} style={grid ? { flex: 1, padding: 10 } : { padding: 10, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        {grid ? (
          <>
            {photo}
            <Txt v="h3" style={{ marginTop: 10 }} numberOfLines={1}>{p.name}</Txt>
            <Txt v="bodySm" color={c.muted} numberOfLines={1} style={{ fontStyle: 'italic' }}>{p.species}</Txt>
            {meta}
          </>
        ) : (
          <>
            {photo}
            <View style={{ flex: 1 }}>
              <Txt v="h3" numberOfLines={1}>{p.name}</Txt>
              <Txt v="bodySm" color={c.muted} numberOfLines={1} style={{ fontStyle: 'italic' }}>{p.species}</Txt>
              {meta}
            </View>
          </>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        key={grid ? 'g' : 'l'} numColumns={grid ? 2 : 1} data={list} keyExtractor={(p) => p.id}
        columnWrapperStyle={grid ? { gap: 12, paddingHorizontal: PAD } : undefined}
        contentContainerStyle={{ paddingBottom: 110, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <TopBar title="My Plants" navigation={navigation} />
            <View style={{ paddingHorizontal: PAD, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <View style={{ flex: 1 }}>
                <Txt v="h1">My Sanctuary</Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.healthy }} />
                  <Txt v="bodySm" color={c.muted}>{state.plants.length} Green Companions thriving</Txt>
                </View>
              </View>
              <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLow, borderRadius: radius.pill, padding: 4 }}>
                {[true, false].map((g) => (
                  <Pressable key={String(g)} onPress={() => setGrid(g)} accessibilityLabel={g ? 'Grid view' : 'List view'} style={{ width: 40, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: grid === g ? c.surface : 'transparent' }}>
                    <Icon name={g ? 'view-grid-outline' : 'view-agenda-outline'} size={20} color={grid === g ? c.accent : c.faint} />
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={{ paddingHorizontal: PAD, flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <View style={{ flex: 1 }}><Field icon="magnify" placeholder="Search companion or room..." value={q} onChangeText={setQ} rightIcon={q ? 'close-circle' : undefined} onRight={() => setQ('')} /></View>
              <Pressable onPress={() => setSortAZ((s) => !s)} accessibilityLabel="Sort A to Z" style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: sortAZ ? c.primary : c.surface, alignItems: 'center', justifyContent: 'center', ...shadow(c, 1) }}>
                <Icon name="sort-alphabetical-ascending" size={22} color={sortAZ ? '#fff' : c.accent} />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: PAD, gap: 8, paddingVertical: 14 }}>
              <Chip label={`All (${state.plants.length})`} selected={filter === 'all'} onPress={() => setFilter('all')} />
              <Chip label={`Needs Care (${needs.length})`} selected={filter === 'needs'} onPress={() => setFilter('needs')} />
              <Chip label="Favorites" icon="heart-outline" selected={filter === 'fav'} onPress={() => setFilter('fav')} />
              {rooms.map((r) => (
                <Chip key={r} label={`${r} (${state.plants.filter((p) => p.room === r).length})`} selected={filter === 'room:' + r} onPress={() => setFilter('room:' + r)} />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={<Empty title="No companions found" sub="Try a different search or filter, or add a new plant." />}
        renderItem={({ item }) => (grid ? Item({ p: item }) : <View style={{ paddingHorizontal: PAD }}>{Item({ p: item })}</View>)}
      />
      <View pointerEvents="box-none" style={{ position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' }}>
        <Btn label="Add New Plant" icon="plus" onPress={() => navigation.navigate('AddPlant')} style={{ paddingHorizontal: 32, backgroundColor: c.primary }} />
      </View>
    </SafeAreaView>
  );
}
