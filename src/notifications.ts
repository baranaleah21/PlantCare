import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Plant, tasksFor, addDays, startOfDay } from './logic';
import { Settings } from './data/seed';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

const CHANNEL = 'care-reminders';

export async function ensurePermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Care reminders', importance: Notifications.AndroidImportance.DEFAULT, lightColor: '#2C5F2D' });
    }
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

const parseTime = (s: string) => {
  const m = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(s.trim());
  if (!m) return 9 * 60;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + Number(m[2]);
};

/** Is `minutes` (since midnight) inside the quiet window? */
export const inQuiet = (minutes: number, s: Settings) => {
  if (!s.quiet) return false;
  const a = parseTime(s.quietFrom), b = parseTime(s.quietTo);
  return a > b ? minutes >= a || minutes < b : minutes >= a && minutes < b;
};

/** Cancel everything and re-schedule one digest per day for the next 14 days. */
export async function rescheduleAll(plants: Plant[], s: Settings) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!s.push) return;
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    const now = new Date();
    const types = s.types ?? { water: true, fertilize: true, mist: true, rotate: true };
    plants = plants.filter((p) => !p.muted).map((p) => ({ ...p, care: p.care.filter((c) => types[c.type] !== false) }));
    const names = (id: string) => plants.find((p) => p.id === id)?.name ?? 'your plant';
    for (let i = 0; i < 14; i++) {
      const day = addDays(startOfDay(now), i);
      if (s.frequency === 'weekly' && day.getDay() !== 0) continue; // Sunday overview
      const list = s.frequency === 'weekly'
        ? Array.from({ length: 7 }, (_, k) => tasksFor(plants, addDays(day, k), now)).flat()
        : tasksFor(plants, day, now);
      if (!list.length) continue;
      let mins = 9 * 60;
      if (inQuiet(mins, s)) mins = parseTime(s.quietTo);
      const when = new Date(day); when.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
      if (when <= now) continue;
      const uniq = Array.from(new Set(list.map((t) => names(t.plantId))));
      const body = uniq.length <= 3 ? uniq.join(', ') + ' could use some love.' : `${uniq.slice(0, 2).join(', ')} and ${uniq.length - 2} more need care.`;
      await Notifications.scheduleNotificationAsync({
        content: { title: s.frequency === 'weekly' ? 'Your plant week ahead 🌿' : 'Time to care for your plants 🌿', body, sound: s.sound !== 'silent' },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when, channelId: CHANNEL },
      });
    }
  } catch {
    /* scheduling is best-effort */
  }
}

export async function sendTest() {
  const ok = await ensurePermission();
  if (!ok) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Time to water your Monstera! 🌿', body: 'Tap below to complete your ritual.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: CHANNEL },
  });
  return true;
}
