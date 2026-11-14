import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, View } from 'react-native';
import { notify } from '../components/dialog';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Btn, Card, Chip, Field, Icon, IconDisc, PAD, PlantPhoto, Tag, TopBar, Txt, useToast } from '../components/ui';
import { fonts, radius, useTheme } from '../theme';
import { useStore } from '../store';
import { LIGHTS, lightLabel, POTS, ROOMS, SOILS, Species, SPECIES } from '../data/species';
import { Sheet } from '../components/ui';
import { Light, Plant, uid } from '../logic';

const CUSTOM = '__custom__';

export default function AddPlantScreen({ navigation }: any) {
  const { c } = useTheme();
  const { dispatch } = useStore();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | undefined>();
  const [nick, setNick] = useState('');
  const [q, setQ] = useState('');
  const [species, setSpecies] = useState<Species | null>(null);
  const [customName, setCustomName] = useState('');
  const [room, setRoom] = useState('Living Room');
  const [customRoom, setCustomRoom] = useState(false);
  const [light, setLight] = useState<Light>('bright');
  const [water, setWater] = useState(7);
  const [fert, setFert] = useState(14);
  const [error, setError] = useState('');
  const [adv, setAdv] = useState(false);
  const [pot, setPot] = useState<string | undefined>();
  const [soil, setSoil] = useState<string | undefined>();

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return SPECIES.slice(0, 3);
    return SPECIES.filter((s) => (s.name + ' ' + s.common).toLowerCase().includes(t)).slice(0, 4);
  }, [q]);

  const speciesName = species ? species.name : customName;
  const displayName = nick.trim() || (species ? species.common : customName) || 'New plant';
  const previewImg = photo ?? species?.image;

  const pick = (s: Species) => {
    setSpecies(s); setCustomName(''); setQ(s.name); setLight(s.light); setWater(s.waterEvery); setFert(s.fertEvery); setError('');
  };
  const useCustom = () => { setSpecies(null); setCustomName(q.trim()); setError(''); };

  const choosePhoto = () => {
    const run = async (cam: boolean) => {
      try {
        const perm = cam ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) { notify('Permission needed', `Please allow ${cam ? 'camera' : 'photo'} access in Settings to add a picture.`); return; }
        const res = cam
          ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] });
        if (!res.canceled && res.assets?.[0]?.uri) setPhoto(res.assets[0].uri);
      } catch { toast("Couldn't open the picker on this device", 'alert-circle-outline'); }
    };
    if (Platform.OS === 'web') { run(false); return; }
    Alert.alert('Add a photo', undefined, [
      { text: 'Take Photo', onPress: () => run(true) },
      { text: 'Choose from Library', onPress: () => run(false) },
      ...(photo ? [{ text: 'Remove photo', style: 'destructive' as const, onPress: () => setPhoto(undefined) }] : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const next = () => {
    if (step === 1 && !speciesName.trim()) { setError('Pick a species from the list, or type your own.'); return; }
    if (step < 3) { setStep(step + 1); return; }
    const now = new Date().toISOString();
    const plant: Plant = {
      id: uid(), name: displayName, species: speciesName, family: species?.family ?? 'Houseplant', room: room.trim() || 'Living Room',
      image: previewImg, light, favorite: false, addedAt: now, repotted: now, repotEveryMonths: 15, waterMl: species?.waterMl ?? 250, potSize: pot, soil,
      care: [
        { type: 'water', every: water, last: now, detail: species?.tip ?? 'Allow the top 2 inches of soil to dry between soaks' },
        ...(fert > 0 ? [{ type: 'fertilize' as const, every: fert, last: now, detail: 'Balanced liquid feed diluted to half strength' }] : []),
      ],
    };
    dispatch({ t: 'addPlant', plant });
    toast(`${displayName} added. Reminders set`, 'check-circle-outline');
    navigation.replace('PlantDetail', { id: plant.id });
  };

  const stepper = (label: string, sub: string, value: number, set: (n: number) => void, min = 1) => (
    <Card style={{ padding: 16, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <IconDisc name={label.startsWith('Water') ? 'water-outline' : 'sprout'} bg={c.mint} color={c.primary} size={40} />
        <View style={{ flex: 1 }}><Txt v="label">{label}</Txt><Txt v="bodySm" color={c.muted}>{sub}</Txt></View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.surfaceLow, borderRadius: radius.lg, padding: 6 }}>
        <Pressable onPress={() => set(Math.max(min, value - 1))} style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Decrease"><Icon name="minus" /></Pressable>
        <View style={{ alignItems: 'center' }}>
          <Txt v="h1">{value === 0 ? 'Off' : `${value} Days`}</Txt>
          <Txt v="micro" color={c.muted}>{value === 7 ? 'Once a week' : value === 0 ? 'No schedule' : `Every ${value} days`}</Txt>
        </View>
        <Pressable onPress={() => set(Math.min(90, value + 1))} style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Increase"><Icon name="plus" /></Pressable>
      </View>
    </Card>
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar title="Add Plant" onBack={() => (step > 1 ? setStep(step - 1) : navigation.goBack())} navigation={navigation} />
      <View style={{ paddingHorizontal: PAD, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.mint, alignItems: 'center', justifyContent: 'center' }}><Txt v="label" color={c.onMint}>{step}</Txt></View>
        <Txt v="h3" style={{ flex: 1 }}>Step {step} of 3</Txt>
        <Tag label={['PLANT DETAILS', 'CARE ENVIRONMENT', 'REVIEW'][step - 1]} />
      </View>
      <View style={{ marginHorizontal: PAD, marginTop: 10, height: 6, borderRadius: 3, backgroundColor: c.surfaceMid }}>
        <View style={{ width: `${(step / 3) * 100}%`, height: 6, borderRadius: 3, backgroundColor: c.primary }} />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: PAD, paddingBottom: 24 }}>
        {step === 1 && (
          <View style={{ gap: 6 }}>
            <Card onPress={choosePhoto} style={{ alignItems: 'center', paddingVertical: 24, gap: 8, overflow: 'hidden' }}>
              {photo ? <PlantPhoto uri={photo} style={{ width: 120, height: 120 }} rounded={60} /> : <IconDisc name="camera-outline" bg={c.mint} color={c.primary} size={64} />}
              <Txt v="h3">{photo ? 'Change photo' : 'Take a photo or upload'}</Txt>
              <Txt v="bodySm" color={c.muted} style={{ textAlign: 'center' }}>Capture natural leaves in warm daylight</Txt>
              <Pressable onPress={() => toast('Auto-ID needs a connection. Search your species below.', 'information-outline')} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: c.surfaceLow, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill }}>
                <Icon name="creation" size={16} color={c.accent} /><Txt v="labelSm" color={c.accent}>Instant AI Species Identifier</Txt>
              </Pressable>
            </Card>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}><Txt v="h3">Plant Nickname</Txt><Txt v="bodySm" color={c.muted}>Optional</Txt></View>
            <Field icon="leaf" placeholder="Monty" value={nick} onChangeText={setNick} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
              <Txt v="h3">Plant Species</Txt>
              {species ? <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><Icon name="check-circle-outline" size={14} color={c.healthy} /><Txt v="labelSm" color={c.healthy}>Auto-detected</Txt></View> : null}
            </View>
            <Field icon="magnify" placeholder="Search species..." value={q} onChangeText={(t) => { setQ(t); if (species && t !== species.name) setSpecies(null); setCustomName(''); setError(''); }} rightIcon={q ? 'close' : undefined} onRight={() => { setQ(''); setSpecies(null); setCustomName(''); }} error={error} />
            <Card style={{ padding: 8, marginTop: 6 }}>
              {matches.map((s) => {
                const on = species?.name === s.name;
                return (
                  <Pressable key={s.name} onPress={() => pick(s)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: radius.md, backgroundColor: on ? c.surfaceLow : 'transparent' }}>
                    <PlantPhoto uri={s.image} style={{ width: 44, height: 44 }} rounded={10} />
                    <View style={{ flex: 1 }}><Txt v="label">{s.name}</Txt><Txt v="bodySm" color={c.muted} style={{ fontStyle: 'italic' }}>{s.common} • {s.family}</Txt></View>
                    <Icon name={on ? 'check-circle-outline' : 'chevron-right'} size={22} color={on ? c.primary : c.faint} />
                  </Pressable>
                );
              })}
              {q.trim() && !species ? (
                <Pressable onPress={useCustom} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: customName ? c.surfaceLow : 'transparent', borderRadius: radius.md }}>
                  <Icon name="plus-circle-outline" size={22} color={c.accent} /><Txt v="label" style={{ flex: 1 }}>Use “{q.trim()}” as custom species</Txt>
                  {customName ? <Icon name="check-circle-outline" size={22} color={c.primary} /> : null}
                </Pressable>
              ) : null}
            </Card>

            <Txt v="h3" style={{ marginTop: 18, marginBottom: 6 }}>Room Placement</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ROOMS.map((r) => <Chip key={r} label={r} selected={room === r && !customRoom} onPress={() => { setRoom(r); setCustomRoom(false); }} />)}
              <Chip label="Custom" icon="plus" selected={customRoom} onPress={() => { setCustomRoom(true); setRoom(''); }} />
            </View>
            {customRoom ? <View style={{ marginTop: 8 }}><Field placeholder="e.g. Sunroom" value={room} onChangeText={setRoom} autoFocus /></View> : null}
          </View>
        )}

        {step === 2 && (
          <View>
            <Txt v="h2" style={{ marginBottom: 4 }}>Care Environment</Txt>
            <Txt v="bodySm" color={c.muted} style={{ marginBottom: 14 }}>{species ? `We pre-filled sensible defaults for ${species.common}. Tweak freely.` : 'Tell us how this plant lives.'}</Txt>
            <Txt v="label" color={c.muted} style={{ marginBottom: 8 }}>Sunlight Exposure</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
              {LIGHTS.map((l) => {
                const on = light === l.key;
                return (
                  <Pressable key={l.key} onPress={() => setLight(l.key)} style={{ width: '48%', padding: 14, borderRadius: radius.lg, backgroundColor: c.surface, borderWidth: 2, borderColor: on ? c.primary : 'transparent', gap: 6, minHeight: 112 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Icon name={l.icon} size={24} color={c.accent} />{on ? <Icon name="check-circle-outline" size={20} color={c.primary} /> : null}</View>
                    <Txt v="label">{l.label}</Txt>
                    <Txt v="micro" color={c.muted}>{l.sub}</Txt>
                  </Pressable>
                );
              })}
            </View>
            {stepper('Watering Cadence', 'Recommended for spring & summer', water, setWater)}
            {stepper('Feeding Cadence', 'Set to 0 to skip fertilizer', fert, setFert, 0)}
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 4 }}><Icon name="lightbulb-on-outline" size={18} color={c.muted} /><Txt v="bodySm" color={c.muted} style={{ flex: 1 }}>{species?.tip ?? 'Allow the top 2 inches of soil to dry between deep soakings.'}</Txt></View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Txt v="h2" style={{ marginBottom: 12 }}>Plant Profile Preview</Txt>
            <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: c.surfaceLow }}>
              <PlantPhoto uri={previewImg} style={{ width: 84, height: 84 }} />
              <View style={{ flex: 1, gap: 2 }}>
                <Txt v="h2" numberOfLines={1}>{displayName}</Txt>
                <Txt v="bodySm" color={c.muted} style={{ fontStyle: 'italic' }} numberOfLines={1}>{speciesName}</Txt>
                <Txt v="bodySm" color={c.muted}>{room || 'Living Room'} • {lightLabel(light)}</Txt>
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><Icon name="clock-outline" size={14} color={c.accent} /><Txt v="labelSm" color={c.accent}>Next soak: in {water} days</Txt></View>
              </View>
            </Card>
            <Card style={{ marginTop: 12, gap: 10 }}>
              <Txt v="label">Reminders that will be set</Txt>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Icon name="water-outline" size={18} color={c.water} /><Txt v="body">Water every {water} days</Txt></View>
              {fert > 0 ? <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Icon name="sprout" size={18} color={c.healthy} /><Txt v="body">Fertilize every {fert} days</Txt></View> : null}
            </Card>
          </View>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: PAD, paddingBottom: 10, gap: 8 }}>
        <Btn label={step === 3 ? 'Save Plant & Set Reminders' : 'Continue'} icon={step === 3 ? 'check' : undefined} iconRight={step < 3 ? 'arrow-right' : undefined} onPress={next} />
        <Btn label={`Advanced Settings (Pot size & Soil)${pot || soil ? ' ✓' : ''}`} variant="secondary" icon="shovel" onPress={() => setAdv(true)} />
      </View>
      <Sheet visible={adv} onClose={() => setAdv(false)} title="Pot size & Soil">
        <Txt v="labelSm" color={c.muted} style={{ marginBottom: 6 }}>Pot size</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{POTS.map((x) => <Chip key={x} label={x} selected={pot === x} onPress={() => setPot(pot === x ? undefined : x)} />)}</View>
        <Txt v="labelSm" color={c.muted} style={{ marginTop: 14, marginBottom: 6 }}>Soil</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{SOILS.map((x) => <Chip key={x} label={x} selected={soil === x} onPress={() => setSoil(soil === x ? undefined : x)} />)}</View>
        <View style={{ height: 16 }} />
        <Btn label="Done" onPress={() => setAdv(false)} />
      </Sheet>
    </SafeAreaView>
  );
}
