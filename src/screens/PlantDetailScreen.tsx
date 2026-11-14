import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pickImages } from '../components/pickPhoto';
import { confirmAction } from '../components/dialog';
import { Btn, Card, Chip, Field, Icon, IconDisc, OptionRow, PAD, PlantPhoto, ProgressBar, Sheet, Tag, TopBar, Txt, useToast } from '../components/ui';
import { fonts, radius, useTheme } from '../theme';
import { useStore } from '../store';
import { ago, ageLabel, careItem, dueLabel, daysSince, diffDays, fmtWater, LIGHT_HOURS, LIGHT_TEXT, moisture, nextDue, plantStatus, uid } from '../logic';
import { lightLabel, POTS, SOILS } from '../data/species';

const DIAGNOSES = [
  { key: 'yellow', icon: 'leaf-circle-outline', title: 'Yellowing leaves', advice: 'Usually overwatering or poor drainage. Let the top 2 inches dry out, check the pot drains freely, and remove the yellowed leaf so energy goes to new growth.' },
  { key: 'brown', icon: 'water-off-outline', title: 'Brown, crispy tips', advice: 'Often low humidity or tap-water minerals. Try filtered water, mist more often, and trim only the brown edge with clean scissors.' },
  { key: 'pests', icon: 'bug-outline', title: 'Tiny pests or webbing', advice: 'Isolate the plant, wipe leaves with a damp cloth, then spray with diluted neem or insecticidal soap. Repeat weekly for 3 weeks.' },
  { key: 'droop', icon: 'arrow-down-circle-outline', title: 'Drooping or limp', advice: 'Check the soil first: bone dry means a deep soak, soggy means let it rest and check for root rot. Droop plus dry soil usually bounces back within hours.' },
  { key: 'leggy', icon: 'arrow-expand-up', title: 'Leggy, stretching growth', advice: 'The plant is reaching for light. Move it closer to a bright window and rotate it weekly. You can prune leggy stems to encourage fullness.' },
];

export default function PlantDetailScreen({ route, navigation }: any) {
  const { c } = useTheme();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const plant = state.plants.find((p) => p.id === route.params.id);
  const [menu, setMenu] = useState(false);
  const [plan, setPlan] = useState(false);
  const [diag, setDiag] = useState(false);
  const [diagSel, setDiagSel] = useState<string | null>(null);
  const [note, setNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notePhotos, setNotePhotos] = useState<string[]>([]);
  const [edit, setEdit] = useState(false);
  const [eName, setEName] = useState('');
  const [eSpecies, setESpecies] = useState('');
  const [ePhoto, setEPhoto] = useState<string | undefined>();
  const [ePot, setEPot] = useState<string | undefined>();
  const [eSoil, setESoil] = useState<string | undefined>();

  useEffect(() => { if (!plant) navigation.goBack(); }, [plant]);
  if (!plant) return null;

  const units = state.settings.units;
  const status = plantStatus(plant);
  const water = careItem(plant, 'water');
  const fert = careItem(plant, 'fertilize');
  const moist = moisture(plant);
  const entries = state.journal.filter((j) => j.plantId === plant.id);
  const monthsSinceRepot = Math.floor(diffDays(new Date(), plant.repotted) / 30.4);
  const repotDue = monthsSinceRepot >= plant.repotEveryMonths;

  const log = (type: 'water' | 'fertilize') => {
    dispatch({ t: 'complete', plantId: plant.id, type });
    toast(type === 'water' ? `${plant.name} watered 💧` : `${plant.name} fertilized 🌱`, 'check-circle-outline');
  };
  const confirmDelete = () => {
    setMenu(false);
    confirmAction(`Remove ${plant.name}?`, 'This also removes its care history and journal notes.', 'Remove', () => { navigation.goBack(); setTimeout(() => dispatch({ t: 'deletePlant', id: plant.id }), 50); });
  };
  const stepper = (type: 'water' | 'fertilize', label: string, item: typeof water) => item && (
    <View style={{ marginBottom: 16 }}>
      <Txt v="labelSm" color={c.muted} style={{ marginBottom: 6 }}>{label}</Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.surfaceLow, borderRadius: radius.lg, padding: 6 }}>
        <Pressable onPress={() => dispatch({ t: 'setInterval', id: plant.id, type, every: item.every - 1 })} style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}><Icon name="minus" size={22} /></Pressable>
        <View style={{ alignItems: 'center' }}>
          <Txt v="h2">{item.every} {item.every === 1 ? 'Day' : 'Days'}</Txt>
          <Txt v="micro" color={c.muted}>{item.every === 7 ? 'Once a week' : item.every === 1 ? 'Daily' : `Every ${item.every} days`}</Txt>
        </View>
        <Pressable onPress={() => dispatch({ t: 'setInterval', id: plant.id, type, every: Math.min(90, item.every + 1) })} style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={22} /></Pressable>
      </View>
    </View>
  );

  const ritual = (icon: string, bg: string, fg: string, title: string, tagLabel: string, tagTone: 'amber' | 'green' | 'neutral' | 'coral', every: string, body: string, foot?: React.ReactNode) => (
    <Card style={{ marginHorizontal: PAD, marginBottom: 12, padding: 18, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <IconDisc name={icon} bg={bg} color={fg} size={48} />
        <Tag label={tagLabel} tone={tagTone} />
      </View>
      <Txt v="h2" style={{ marginTop: 6 }}>{title}</Txt>
      <Txt v="label" color={c.accent}>{every}</Txt>
      <Txt v="bodySm" color={c.muted}>{body}</Txt>
      {foot}
    </Card>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar title="Plant Details" onBack={() => navigation.goBack()} navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: PAD, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Tag tone="green" icon="leaf" label={plant.name} />
          <Tag label={`${plant.room}`} />
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => dispatch({ t: 'toggleFav', id: plant.id })} hitSlop={10} accessibilityLabel="Favorite"><Icon name={plant.favorite ? 'heart' : 'heart-outline'} size={26} color={plant.favorite ? c.coral : c.text} /></Pressable>
          <Pressable onPress={() => setMenu(true)} hitSlop={10} accessibilityLabel="More actions"><Icon name="dots-vertical" size={26} /></Pressable>
        </View>

        <View style={{ marginHorizontal: PAD, marginTop: 14, borderRadius: radius.xl, overflow: 'hidden' }}>
          <PlantPhoto uri={plant.image} rounded={0} style={{ width: '100%', aspectRatio: 1.05 }} />
          <View style={{ position: 'absolute', top: 12, left: 12 }}>
            <Tag tone={status.status === 'healthy' ? 'green' : status.status === 'needs-water' ? 'amber' : 'coral'} icon={status.status === 'healthy' ? 'leaf' : 'water-outline'}
              label={status.status === 'healthy' ? 'Healthy & Thriving' : status.status === 'needs-water' ? 'Needs Water' : 'Needs Misting'} />
          </View>
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: 'rgba(15,30,15,0.55)', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Txt v="h1" color="#fff" numberOfLines={1}>{plant.name}</Txt>
              <Txt v="bodySm" color="#E7F1E2" numberOfLines={1} style={{ fontStyle: 'italic' }}>{plant.species} • {plant.family}</Txt>
            </View>
            <View style={{ backgroundColor: c.primary, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Icon name="calendar-blank-outline" size={14} color="#fff" /><Txt v="labelSm" color="#fff">Age {ageLabel(plant.addedAt)}</Txt>
            </View>
          </View>
        </View>

        <Card style={{ marginHorizontal: PAD, marginTop: 14, padding: 8, flexDirection: 'row', gap: 8 }}>
          <Btn label="Log Water" icon="water-outline" onPress={() => log('water')} disabled={!water} style={{ flex: 2 }} />
          <Btn label="Fertilize" icon="sprout" variant="secondary" onPress={() => log('fertilize')} disabled={!fert} style={{ flex: 2 }} />
          <Pressable onPress={() => navigation.navigate('Tabs', { screen: 'History', params: { plantId: plant.id } })} accessibilityLabel="View history" style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.surfaceLow, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="history" size={22} color={c.accent} />
          </Pressable>
        </Card>

        <View style={{ paddingHorizontal: PAD, marginTop: 28, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View><Txt v="h2">Care Rituals</Txt><Txt v="bodySm" color={c.muted}>Optimal environment & hydration rhythm</Txt></View>
          <Pressable onPress={() => setPlan(true)} hitSlop={8} style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><Txt v="labelSm" color={c.accent}>Adjust Plan</Txt><Icon name="tune-variant" size={16} color={c.accent} /></Pressable>
        </View>

        {water ? ritual('water-outline', c.waterBg, c.water, 'Watering',
          dueLabel(diffDays(nextDue(water), new Date())), diffDays(nextDue(water), new Date()) <= 0 ? 'amber' : 'neutral',
          `Every ${water.every} Days`, `${fmtWater(plant.waterMl, units)} filtered room-temp water. ${water.detail}.`,
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Txt v="labelSm" color={c.muted}>Soil Moisture</Txt><Txt v="labelSm" color={moist < 40 ? c.amberText : c.healthy}>{moist}% ({moist < 40 ? 'Dry' : moist < 70 ? 'Moist' : 'Wet'})</Txt>
            </View>
            <ProgressBar pct={moist} color={moist < 40 ? c.amber : c.healthy} />
          </View>) : null}

        {ritual('white-balance-sunny', c.sunBg, c.amber, 'Sunlight Needs', LIGHT_HOURS[plant.light], 'neutral', lightLabel(plant.light), LIGHT_TEXT[plant.light],
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 6 }}><Icon name="map-marker-outline" size={16} color={c.muted} /><Txt v="bodySm" color={c.muted}>Placed in {plant.room}</Txt></View>)}

        {fert ? ritual('sprout', c.mint, c.onMint, 'Fertilizer Schedule', dueLabel(diffDays(nextDue(fert), new Date())), diffDays(nextDue(fert), new Date()) <= 0 ? 'amber' : 'neutral',
          `Every ${fert.every} Days`, fert.detail,
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 6 }}><Icon name="history" size={16} color={c.muted} /><Txt v="bodySm" color={c.muted}>Last fed {daysSince(fert.last)} days ago</Txt></View>)
          : (
            <Card style={{ marginHorizontal: PAD, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconDisc name="sprout" bg={c.mint} color={c.onMint} />
              <View style={{ flex: 1 }}><Txt v="label">No fertilizer schedule</Txt><Txt v="bodySm" color={c.muted}>Add a gentle monthly feed.</Txt></View>
              <Btn small variant="secondary" label="Add" onPress={() => { dispatch({ t: 'updatePlant', id: plant.id, patch: { care: [...plant.care, { type: 'fertilize', every: 30, last: new Date().toISOString(), detail: 'Balanced liquid feed diluted to half strength' }] } }); toast('Fertilizer schedule added', 'sprout'); }} />
            </Card>
          )}

        {ritual('shovel', c.soilBg, c.soil, 'Repotting Cycle', repotDue ? 'Due Soon' : 'Good Condition', repotDue ? 'amber' : 'neutral', `Every ${plant.repotEveryMonths} Months`,
          `${plant.potSize ? `Pot: ${plant.potSize}. ` : ''}${plant.soil ? `Soil: ${plant.soil}.` : 'Breathable pot with a chunky mix keeps roots airy.'}`,
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 6 }}><Icon name="check-circle-outline" size={16} color={c.muted} /><Txt v="bodySm" color={c.muted}>Repotted {new Date(plant.repotted).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</Txt></View>)}

        <Card style={{ marginHorizontal: PAD, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.mintSoft }}>
          <IconDisc name="sprout-outline" bg={c.mint} color={c.primary} size={48} />
          <View style={{ flex: 1 }}><Txt v="h3" numberOfLines={1}>Vigor & Foliage Check</Txt><Txt v="bodySm" color={c.muted} numberOfLines={2}>Spot yellowing, pests or droop early.</Txt></View>
          <Btn small label="Diagnose" variant="outline" onPress={() => { setDiagSel(null); setDiag(true); }} />
        </Card>

        <View style={{ paddingHorizontal: PAD, marginTop: 28, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View><Txt v="h2">Growth Journal</Txt><Txt v="bodySm" color={c.muted}>Milestones and keeper notes</Txt></View>
          <Btn small variant="secondary" icon="plus" label="Add Note" onPress={() => { setNoteTitle(''); setNoteText(''); setNotePhotos([]); setNote(true); }} />
        </View>
        {entries.length === 0 ? (
          <Card style={{ marginHorizontal: PAD }}><Txt v="bodySm" color={c.muted}>No notes yet. Jot down a new leaf, a repot, or anything you notice.</Txt></Card>
        ) : entries.map((e) => (
          <Card key={e.id} style={{ marginHorizontal: PAD, marginBottom: 12, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary }} /><Txt v="label" numberOfLines={1} style={{ flex: 1 }}>{e.title}</Txt></View>
              <Txt v="bodySm" color={c.muted}>{ago(e.date)}</Txt>
            </View>
            <Txt v="body" color={c.muted} style={{ fontStyle: 'italic' }}>“{e.text}”</Txt>
            {e.photos?.length ? (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                {e.photos.slice(0, 2).map((u) => <PlantPhoto key={u} uri={u} style={{ width: 72, height: 72 }} rounded={12} />)}
                {e.photos.length > 2 ? <View style={{ flex: 1, height: 72, borderRadius: 12, backgroundColor: c.surfaceLow, alignItems: 'center', justifyContent: 'center' }}><Txt v="labelSm">+{e.photos.length - 2} Photos</Txt></View> : null}
              </View>
            ) : null}
            <Pressable onPress={() => confirmAction('Delete this note?', undefined, 'Delete', () => dispatch({ t: 'deleteJournal', id: e.id }))} hitSlop={8} style={{ alignSelf: 'flex-start' }}><Txt v="micro" color={c.faint}>Delete note</Txt></Pressable>
          </Card>
        ))}
      </ScrollView>

      <Sheet visible={menu} onClose={() => setMenu(false)} title={plant.name}>
        <OptionRow icon="content-cut" label="Log pruning" sub="Record a trim or tidy-up" onPress={() => { setMenu(false); dispatch({ t: 'addLog', plantId: plant.id, type: 'prune' }); toast('Pruning logged', 'content-cut'); }} />
        <OptionRow icon="shovel" label="Log repotting" sub="Resets the repotting cycle" onPress={() => { setMenu(false); dispatch({ t: 'addLog', plantId: plant.id, type: 'repot' }); toast('Repotting logged', 'shovel'); }} />
        <OptionRow icon="pencil-outline" label="Edit plant details" sub="Name, species, photo, pot & soil" onPress={() => { setMenu(false); setEName(plant.name); setESpecies(plant.species); setEPhoto(plant.image); setEPot(plant.potSize); setESoil(plant.soil); setEdit(true); }} />
        <OptionRow icon="share-variant-outline" label="Share this plant" onPress={() => { setMenu(false); Share.share({ message: `${plant.name} (${plant.species}) lives in my ${plant.room}. Watered every ${water?.every ?? '?'} days. 🌿 via PlantCare` }).catch(() => {}); }} />
        <OptionRow icon="calendar-month-outline" label="View in calendar" onPress={() => { setMenu(false); navigation.navigate('Tabs', { screen: 'Calendar' }); }} />
        <OptionRow icon="trash-can-outline" label="Remove plant" onPress={confirmDelete} />
      </Sheet>

      <Sheet visible={plan} onClose={() => setPlan(false)} title="Adjust Plan">
        {stepper('water', 'Watering every', water)}
        {stepper('fertilize', 'Fertilizing every', fert)}
        <Txt v="labelSm" color={c.muted} style={{ marginBottom: 6 }}>Room</Txt>
        <Field value={plant.room} onChangeText={(t) => dispatch({ t: 'updatePlant', id: plant.id, patch: { room: t } })} icon="home-outline" />
        <View style={{ height: 16 }} />
        <Btn label="Done" onPress={() => setPlan(false)} />
      </Sheet>

      <Sheet visible={diag} onClose={() => setDiag(false)} title="Botanical Wellness Check">
        {!diagSel ? (
          <>
            <Txt v="body" color={c.muted} style={{ marginBottom: 10 }}>What are you noticing on your {plant.name}?</Txt>
            {DIAGNOSES.map((d) => <OptionRow key={d.key} icon={d.icon} label={d.title} onPress={() => setDiagSel(d.key)} />)}
          </>
        ) : (() => {
          const d = DIAGNOSES.find((x) => x.key === diagSel)!;
          return (
            <View style={{ gap: 12 }}>
              <Card style={{ backgroundColor: c.amberBg, shadowOpacity: 0, elevation: 0 }}>
                <Txt v="h3" color={c.amberText}>{d.title}</Txt>
                <Txt v="body" style={{ marginTop: 6 }}>{d.advice}</Txt>
              </Card>
              <Btn label="Save to journal" variant="secondary" icon="notebook-outline" onPress={() => { dispatch({ t: 'addJournal', entry: { id: uid(), plantId: plant.id, title: d.title, text: d.advice, date: new Date().toISOString() } }); setDiag(false); toast('Saved to growth journal', 'notebook-outline'); }} />
              <Btn label="Back" variant="ghost" onPress={() => setDiagSel(null)} />
            </View>
          );
        })()}
      </Sheet>

      <Sheet visible={note} onClose={() => setNote(false)} title="Add Growth Note">
        <Field placeholder="Title (e.g. New leaf!)" value={noteTitle} onChangeText={setNoteTitle} />
        <View style={{ height: 10 }} />
        <Field placeholder="What did you notice?" value={noteText} onChangeText={setNoteText} multiline style={{ minHeight: 90, textAlignVertical: 'top' }} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {notePhotos.map((u) => <Pressable key={u} onPress={() => setNotePhotos(notePhotos.filter((x) => x !== u))}><PlantPhoto uri={u} style={{ width: 56, height: 56 }} rounded={10} /></Pressable>)}
          <Btn small variant="secondary" icon="image-plus" label={notePhotos.length ? 'Add more' : 'Add photos'} onPress={async () => { const u = await pickImages(true, 3); if (u.length) setNotePhotos((p) => [...p, ...u].slice(0, 6)); }} />
        </View>
        {notePhotos.length ? <Txt v="micro" color={c.faint} style={{ marginTop: 4 }}>Tap a photo to remove it</Txt> : null}
        <View style={{ height: 14 }} />
        <Btn label="Save note" disabled={!noteText.trim()} onPress={() => {
          dispatch({ t: 'addJournal', entry: { id: uid(), plantId: plant.id, title: noteTitle.trim() || 'Growth note', text: noteText.trim(), date: new Date().toISOString(), photos: notePhotos } });
          setNote(false); setNotePhotos([]); toast('Note added', 'notebook-outline');
        }} />
      </Sheet>

      <Sheet visible={edit} onClose={() => setEdit(false)} title="Edit Plant">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <PlantPhoto uri={ePhoto} style={{ width: 72, height: 72 }} rounded={16} />
          <Btn small variant="secondary" icon="camera-outline" label="Change photo" onPress={async () => { const u = await pickImages(false); if (u[0]) setEPhoto(u[0]); }} />
        </View>
        <Txt v="labelSm" color={c.muted} style={{ marginBottom: 6 }}>Nickname</Txt>
        <Field value={eName} onChangeText={setEName} icon="leaf" />
        <Txt v="labelSm" color={c.muted} style={{ marginTop: 12, marginBottom: 6 }}>Species</Txt>
        <Field value={eSpecies} onChangeText={setESpecies} icon="magnify" />
        <Txt v="labelSm" color={c.muted} style={{ marginTop: 12, marginBottom: 6 }}>Pot size</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{POTS.map((x) => <Chip key={x} label={x} selected={ePot === x} onPress={() => setEPot(ePot === x ? undefined : x)} />)}</View>
        <Txt v="labelSm" color={c.muted} style={{ marginTop: 12, marginBottom: 6 }}>Soil</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{SOILS.map((x) => <Chip key={x} label={x} selected={eSoil === x} onPress={() => setESoil(eSoil === x ? undefined : x)} />)}</View>
        <View style={{ height: 16 }} />
        <Btn label="Save changes" disabled={!eName.trim() || !eSpecies.trim()} onPress={() => { dispatch({ t: 'updatePlant', id: plant.id, patch: { name: eName.trim(), species: eSpecies.trim(), image: ePhoto, potSize: ePot, soil: eSoil } }); setEdit(false); toast('Plant updated', 'check-circle-outline'); }} />
      </Sheet>
    </SafeAreaView>
  );
}
