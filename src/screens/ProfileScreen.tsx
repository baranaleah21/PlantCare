import React, { useState } from 'react';
import { Alert, Pressable, Share, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Btn, Card, Field, Icon, IconDisc, OptionRow, PAD, Screen, Segmented, Sheet, Tag, Toggle, TopBar, Txt, useToast, Avatar } from '../components/ui';
import { fonts, radius, useTheme } from '../theme';
import { useStore } from '../store';
import { streak, toCsv } from '../logic';
import { Settings } from '../data/seed';
import { confirmAction, notify } from '../components/dialog';
import { ensurePermission, sendTest } from '../notifications';

const FREQ: { key: Settings['frequency']; label: string; sub: string }[] = [
  { key: 'adaptive', label: 'Smart Adaptive (Recommended)', sub: 'Learns your routine and nudges at the right time' },
  { key: 'daily', label: 'Daily digest', sub: 'One gentle summary each morning' },
  { key: 'weekly', label: 'Weekly overview', sub: 'A Sunday plan for the week ahead' },
];
const SOUNDS: { key: Settings['sound']; label: string }[] = [{ key: 'chime', label: 'Gentle Chime 🍃' }, { key: 'rain', label: 'Soft Rain' }, { key: 'birdsong', label: 'Birdsong' }, { key: 'silent', label: 'Silent' }];
const QUIET = [['9:00 PM', '7:00 AM'], ['10:00 PM', '8:00 AM'], ['11:00 PM', '9:00 AM']];
const GUIDES = [
  ['Watering without worry', 'Check the top 2 inches of soil. If it is dry, water deeply until it drains, then empty the saucer. Most houseplants die from too much water, not too little.'],
  ['Understanding light', 'Bright indirect light is a spot where you could read comfortably all day without the sun hitting the leaves directly. Rotate plants weekly for even growth.'],
  ['Humidity for tropicals', 'Group plants together, use a pebble tray, or run a small humidifier. Misting is a short-term boost, not a fix.'],
  ['When to repot', 'Roots circling the drainage holes, water running straight through, or growth that has stalled in the growing season are all signs it is time.'],
  ['Pests, gently', 'Isolate the plant, wipe leaves, and treat with neem or insecticidal soap weekly for three weeks. Check the undersides of leaves.'],
];


function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ marginTop: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: PAD, marginBottom: 10 }}><Icon name={icon} size={20} color={c.accent} /><Txt v="h3">{title}</Txt></View>
      <Card style={{ marginHorizontal: PAD, padding: 0 }}>{children}</Card>
    </View>
  );
}
function Row({ icon, title, sub, right, onPress, last, subColor }: { icon: string; title: string; sub?: string; right?: React.ReactNode; onPress?: () => void; last?: boolean; subColor?: string }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.divider, backgroundColor: pressed ? c.surfaceLow : 'transparent', borderRadius: last ? radius.xl : 0 })}>
      <IconDisc name={icon} bg={c.mint} color={c.primary} size={40} />
      <View style={{ flex: 1 }}><Txt v="label" style={{ fontFamily: fonts.bold }}>{title}</Txt>{sub ? <Txt v="bodySm" color={subColor ?? c.muted}>{sub}</Txt> : null}</View>
      {right ?? (onPress ? <Icon name="chevron-right" size={22} color={c.faint} /> : null)}
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }: any) {
  const { c } = useTheme();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const s = state.settings;
  const [sheet, setSheet] = useState<null | 'freq' | 'sound' | 'quiet' | 'guides' | 'terms' | 'edit'>(null);
  const [syncing, setSyncing] = useState(false);
  const [name, setName] = useState(state.user.name);
  const [openGuide, setOpenGuide] = useState<number | null>(null);
  const set = (patch: Partial<Settings>) => dispatch({ t: 'settings', patch });

  const sync = () => { setSyncing(true); setTimeout(() => { dispatch({ t: 'sync' }); setSyncing(false); toast('Library backed up', 'cloud-check-outline'); }, 1100); };
  const synced = () => { const m = Math.round((Date.now() - new Date(s.lastSynced).getTime()) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} mins ago` : `${Math.round(m / 60)}h ago`; };
  const changePhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { notify('Permission needed', 'Allow photo access in Settings to change your picture.'); return; }
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
      if (!r.canceled && r.assets?.[0]?.uri) dispatch({ t: 'user', patch: { avatar: r.assets[0].uri } });
    } catch { toast("Couldn't open the photo picker", 'alert-circle-outline'); }
  };
  const signOut = () => confirmAction('Sign out?', 'Your plants stay saved on this device.', 'Sign Out', () => dispatch({ t: 'logout' }));
  const exportLog = async () => { try { await Share.share({ title: 'PlantCare care log', message: toCsv(state.logs, state.plants) }); } catch {} };
  const resetData = () => confirmAction('Reset sample data?', 'This restores the sample plants and removes your changes.', 'Reset', () => dispatch({ t: 'reset' }));

  const stat = (v: string, l: string, col?: string) => <View style={{ flex: 1, alignItems: 'center' }}><Txt v="h2" color={col ?? c.accent}>{v}</Txt><Txt v="micro" color={c.muted}>{l}</Txt></View>;
  const freq = FREQ.find((x) => x.key === s.frequency)!;

  return (
    <Screen>
      <TopBar title="Profile" navigation={navigation} />
      <Card style={{ marginHorizontal: PAD, marginTop: 4, alignItems: 'center', paddingVertical: 20, gap: 6 }}>
        <View>
          <Avatar uri={state.user.avatar} size={104} />
          <Pressable onPress={changePhoto} accessibilityLabel="Change photo" style={{ position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: c.surface }}>
            <Icon name="pencil" size={15} color="#fff" />
          </Pressable>
        </View>
        <Pressable onPress={() => { setName(state.user.name); setSheet('edit'); }} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 6 }}>
          <Txt v="h1">{state.user.name}</Txt><Icon name="pencil-outline" size={16} color={c.faint} />
        </Pressable>
        <Txt v="bodySm" color={c.muted}>{state.user.email}</Txt>
        <Tag tone="green" icon="leaf" label={`Green Companion since ${state.user.since}`} />
        <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLow, borderRadius: radius.lg, paddingVertical: 14, marginTop: 10, alignSelf: 'stretch' }}>
          {stat(String(state.plants.length), 'Plants')}{stat(String(state.logs.length), 'Rituals')}{stat(`${streak(state.logs)} 🔥`, 'Day Streak', c.terracotta)}
        </View>
      </Card>

      <Section icon="bell-ring-outline" title="Care Notifications & Reminders">
        <Row icon="bell-outline" title="Push Notifications" sub="Daily gentle plant reminders" right={<Toggle value={s.push} onChange={async (v) => { if (v && !(await ensurePermission())) { toast('Allow notifications in Settings to get reminders', 'bell-off-outline'); return; } set({ push: v }); }} />} />
        <Row icon="tune-variant" title="Manage reminders" sub="By type and by plant" onPress={() => navigation.navigate('Reminders')} />
        <Row icon="bell-ring-outline" title="Send a test reminder" sub="Arrives in about 3 seconds" onPress={async () => { const ok = await sendTest(); toast(ok ? 'Test reminder on its way' : 'Notifications are not allowed', ok ? 'bell-ring-outline' : 'bell-off-outline'); }} />
        <Row icon="clock-outline" title="Reminder Frequency" sub={freq.label} subColor={c.accent} onPress={() => setSheet('freq')} />
        <Row icon="music-note" title="Notification Sound" sub={SOUNDS.find((x) => x.key === s.sound)!.label} onPress={() => setSheet('sound')} />
        <Row icon="weather-night" title="Quiet Hours" sub={`${s.quietFrom} – ${s.quietTo}`} last onPress={() => setSheet('quiet')} right={<Toggle value={s.quiet} onChange={(v) => set({ quiet: v })} />} />
      </Section>

      <Section icon="tune-variant" title="Preferences & Units">
        <View style={{ padding: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: c.divider }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt v="label" style={{ fontFamily: fonts.bold }}>Measurement Units</Txt><Txt v="bodySm" color={c.muted}>Water & Room Temp</Txt></View>
          <Segmented<Settings['units']> dense options={[{ key: 'metric', label: 'Metric (ml / °C)' }, { key: 'imperial', label: 'Imperial (oz / °F)' }]} value={s.units} onChange={(u) => set({ units: u })} />
        </View>
        <View style={{ padding: 14, gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt v="label" style={{ fontFamily: fonts.bold }}>App Theme</Txt><Txt v="bodySm" color={c.muted}>Visual tone</Txt></View>
          <Segmented<Settings['theme']> dense options={[{ key: 'light', label: 'Warm Cream' }, { key: 'dark', label: 'Botanical Dark' }, { key: 'system', label: 'System' }]} value={s.theme} onChange={(t) => set({ theme: t })} />
        </View>
      </Section>

      <Section icon="cloud-sync-outline" title="Plant Library & Cloud Backup">
        <Row icon="cloud-check-outline" title="Auto Cloud Sync" sub={`Last synced ${synced()}`} right={<Btn small variant="secondary" label={syncing ? 'Syncing…' : 'Sync Now'} disabled={syncing} onPress={sync} />} />
        <Row icon="export-variant" title="Export Plant Care Log" sub="Share your history as CSV" last onPress={exportLog} />
      </Section>

      <Section icon="sprout-outline" title="Support & Community">
        <Row icon="medical-bag" title="Plant Doctor & Care Guides" onPress={() => setSheet('guides')} />
        <Row icon="shield-account-outline" title="Terms & Privacy Policy" onPress={() => setSheet('terms')} />
        <Row icon="information-outline" title="PlantCare Version" last right={<Tag label="v2.4.0" />} />
      </Section>

      <View style={{ paddingHorizontal: PAD, marginTop: 24 }}><Btn label="Sign Out" icon="logout" variant="danger" onPress={signOut} /><Btn label="Reset sample data" variant="ghost" onPress={resetData} style={{ marginTop: 4 }} /></View>

      <Sheet visible={sheet === 'freq'} onClose={() => setSheet(null)} title="Reminder Frequency">
        {FREQ.map((x) => <OptionRow key={x.key} label={x.label} sub={x.sub} selected={s.frequency === x.key} onPress={() => { set({ frequency: x.key }); setSheet(null); }} />)}
      </Sheet>
      <Sheet visible={sheet === 'sound'} onClose={() => setSheet(null)} title="Notification Sound">
        {SOUNDS.map((x) => <OptionRow key={x.key} label={x.label} selected={s.sound === x.key} onPress={() => { set({ sound: x.key }); setSheet(null); }} />)}
      </Sheet>
      <Sheet visible={sheet === 'quiet'} onClose={() => setSheet(null)} title="Quiet Hours">
        {QUIET.map(([a, b]) => <OptionRow key={a} label={`${a} – ${b}`} selected={s.quietFrom === a} onPress={() => { set({ quietFrom: a, quietTo: b, quiet: true }); setSheet(null); }} />)}
      </Sheet>
      <Sheet visible={sheet === 'guides'} onClose={() => setSheet(null)} title="Plant Doctor & Care Guides">
        {GUIDES.map(([t, b], i) => (
          <Pressable key={t} onPress={() => setOpenGuide(openGuide === i ? null : i)} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.divider }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Txt v="label" style={{ flex: 1 }}>{t}</Txt><Icon name={openGuide === i ? 'chevron-up' : 'chevron-down'} size={22} color={c.faint} /></View>
            {openGuide === i ? <Txt v="body" color={c.muted} style={{ marginTop: 8 }}>{b}</Txt> : null}
          </Pressable>
        ))}
      </Sheet>
      <Sheet visible={sheet === 'terms'} onClose={() => setSheet(null)} title="Terms & Privacy">
        <Txt v="body" color={c.muted}>PlantCare stores your plants, care history and settings on this device. Nothing leaves your phone unless you export or share it yourself. Photos you add stay on the device and are only used to illustrate your plants.{'\n\n'}This is a prototype build; replace this text with your real terms and privacy policy before release.</Txt>
      </Sheet>
      <Sheet visible={sheet === 'edit'} onClose={() => setSheet(null)} title="Edit Profile">
        <Txt v="labelSm" color={c.muted} style={{ marginBottom: 6 }}>Display name</Txt>
        <Field value={name} onChangeText={setName} icon="account-outline" autoCapitalize="words" />
        <View style={{ height: 14 }} />
        <Btn label="Save" disabled={name.trim().length < 2} onPress={() => { dispatch({ t: 'user', patch: { name: name.trim() } }); setSheet(null); toast('Profile updated', 'check-circle-outline'); }} />
      </Sheet>
    </Screen>
  );
}
