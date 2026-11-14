import React, { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Btn, Card, Icon, IconDisc, PAD, PlantPhoto, Tag, TopBar, Toggle, Txt, useToast } from '../components/ui';
import { careMeta } from '../components/care';
import { fonts, radius, useTheme } from '../theme';
import { useStore } from '../store';
import { careItem, daysSince, fmtWater } from '../logic';

const COPY = {
  water: { tag: 'Scheduled Hydration', verb: 'water', tip: 'Soil feels dry to the first knuckle? Perfect time for a gentle soak. Pour slowly until droplets surface in the saucer.' },
  fertilize: { tag: 'Scheduled Feeding', verb: 'feed', tip: 'Dilute to half strength and water lightly first. Never fertilize bone-dry soil.' },
  mist: { tag: 'Scheduled Misting', verb: 'mist', tip: 'Mist in the morning so leaves dry by evening. Hold the bottle a forearm away for a soft veil.' },
  rotate: { tag: 'Scheduled Rotation', verb: 'rotate', tip: 'Turn the pot a quarter turn clockwise so every side gets a turn in the light.' },
} as const;

export default function CareSessionScreen({ route, navigation }: any) {
  const { c } = useTheme();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { plantId, type = 'water' } = route.params as { plantId: string; type: keyof typeof COPY };
  const plant = state.plants.find((p) => p.id === plantId);
  useEffect(() => { if (!plant) navigation.goBack(); }, [plant]);
  if (!plant) return null;

  const item = careItem(plant, type);
  const copy = COPY[type];
  const meta = careMeta(c)[type];
  const since = item ? daysSince(item.last) : 0;
  const amt = fmtWater(plant.waterMl, state.settings.units);
  const body = type === 'water'
    ? <>Your {plant.name} in the {plant.room} is thirsty. It has been <Txt v="body" style={{ fontFamily: fonts.bold }} color={c.accent}>{since} days</Txt> since the last drink. Give it about <Txt v="body" style={{ fontFamily: fonts.bold }}>{amt}</Txt> of room temperature water.</>
    : <>Your {plant.name} in the {plant.room} is ready for a {copy.verb}. It has been <Txt v="body" style={{ fontFamily: fonts.bold }} color={c.accent}>{since} days</Txt> since the last one.</>;

  const done = () => { dispatch({ t: 'complete', plantId, type }); toast(`${plant.name}: ${meta.label.toLowerCase()} done 🌿`, 'check-circle-outline'); navigation.goBack(); };
  const snooze = () => { dispatch({ t: 'snooze', plantId, type, hours: 3 }); toast('Snoozed for 3 hours', 'clock-outline'); navigation.goBack(); };
  const skip = () => { dispatch({ t: 'skip', plantId, type }); toast('Skipped this cycle', 'skip-next-outline'); navigation.goBack(); };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar title={type === 'water' ? 'Watering Session' : 'Care Session'} onBack={() => navigation.goBack()} navigation={navigation} />
      <ScrollView contentContainerStyle={{ padding: PAD, gap: 14, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <IconDisc name="sprout" bg={c.mint} color={c.primary} size={32} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Txt v="labelSm" color={c.accent}>PlantCare</Txt><Txt v="micro" color={c.muted}>• Just now</Txt></View>
            <Txt v="h3" style={{ marginTop: 6 }}>Time to {copy.verb} your {plant.name}! 🌿</Txt>
            <Txt v="bodySm" color={c.muted}>Your {plant.species} in the {plant.room} is waiting. Tap below to complete your ritual.</Txt>
          </View>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="Dismiss"><Icon name="close" size={20} color={c.muted} /></Pressable>
        </Card>

        <Card style={{ gap: 14, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tag tone="amber" icon="circle-medium" label={copy.tag} />
            {item ? <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><Icon name="clock-outline" size={14} color={c.muted} /><Txt v="labelSm" color={c.muted}>Day {Math.min(since, item.every)} of {item.every}</Txt></View> : null}
          </View>
          <View style={{ flexDirection: 'row', gap: 14, backgroundColor: c.surfaceLow, borderRadius: radius.lg, padding: 10 }}>
            <PlantPhoto uri={plant.image} style={{ width: 96, height: 96 }} rounded={14} />
            <View style={{ flex: 1, justifyContent: 'center', gap: 6 }}>
              <Txt v="h2" numberOfLines={1}>{plant.name}</Txt>
              <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><Icon name="home-outline" size={14} color={c.muted} /><Txt v="bodySm" color={c.muted}>{plant.room}</Txt></View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Tag tone="coral" label={`Needs ${meta.label}`} />
                {type === 'water' ? <Txt v="micro" color={c.muted}>{amt} recommended</Txt> : null}
              </View>
            </View>
          </View>
          <Txt v="body">{body}</Txt>
          <View style={{ flexDirection: 'row', gap: 10, backgroundColor: c.surfaceLow, borderRadius: radius.lg, padding: 14 }}>
            <Icon name="lightbulb-on-outline" size={20} color={c.muted} />
            <Txt v="bodySm" color={c.muted} style={{ flex: 1 }}>{copy.tip}</Txt>
          </View>
          <Btn label="Mark as Done" icon="check-circle-outline" onPress={done} />
          <Btn label="Snooze 3 Hours" icon="clock-outline" variant="secondary" onPress={snooze} />
          <Pressable onPress={skip} style={{ alignSelf: 'center', padding: 8 }}><Txt v="label" color={c.terracotta}>Skip this cycle</Txt></Pressable>
        </Card>

        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          <Icon name="weather-night" size={22} color={c.accent} />
          <View style={{ flex: 1 }}>
            <Txt v="label">Quiet Hours {state.settings.quiet ? `active after ${state.settings.quietFrom}` : 'off'}</Txt>
            <Txt v="bodySm" color={c.muted}>Reminders rest until sunrise</Txt>
          </View>
          <Toggle value={state.settings.quiet} onChange={(v) => dispatch({ t: 'settings', patch: { quiet: v } })} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
