import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, buildSeed, Settings, UserProfile } from './data/seed';
import { addDays, CareType, JournalEntry, Log, LogType, Plant, uid } from './logic';

const KEY = 'plantcare:v1';

export type Action =
  | { t: 'hydrate'; state: AppState }
  | { t: 'login'; name?: string; email: string }
  | { t: 'logout' }
  | { t: 'complete'; plantId: string; type: CareType; note?: string }
  | { t: 'undo'; plantId: string; type: CareType }
  | { t: 'snooze'; plantId: string; type: CareType; hours: number }
  | { t: 'skip'; plantId: string; type: CareType }
  | { t: 'addPlant'; plant: Plant }
  | { t: 'updatePlant'; id: string; patch: Partial<Plant> }
  | { t: 'setInterval'; id: string; type: CareType; every: number }
  | { t: 'deletePlant'; id: string }
  | { t: 'toggleFav'; id: string }
  | { t: 'toggleMute'; id: string }
  | { t: 'addLog'; plantId: string; type: LogType; note?: string }
  | { t: 'deleteLog'; id: string }
  | { t: 'addJournal'; entry: JournalEntry }
  | { t: 'deleteJournal'; id: string }
  | { t: 'settings'; patch: Partial<Settings> }
  | { t: 'user'; patch: Partial<UserProfile> }
  | { t: 'sync' }
  | { t: 'reset' };

const sameLocalDay = (a: string, b: Date) => new Date(a).toDateString() === b.toDateString();

export function reducer(s: AppState, a: Action): AppState {
  const now = new Date();
  switch (a.t) {
    case 'hydrate': return { ...a.state, settings: { ...buildSeed().settings, ...a.state.settings } };
    case 'login': return { ...s, authed: true, user: { ...s.user, email: a.email, name: a.name || s.user.name } };
    case 'logout': return { ...s, authed: false };
    case 'complete': {
      const plants = s.plants.map((p) => p.id !== a.plantId ? p : {
        ...p, care: p.care.map((c) => c.type !== a.type ? c : { ...c, prevLast: c.last, last: now.toISOString(), snoozedUntil: undefined }),
      });
      const log: Log = { id: uid(), plantId: a.plantId, type: a.type, date: now.toISOString(), note: a.note };
      return { ...s, plants, logs: [log, ...s.logs] };
    }
    case 'undo': {
      const idx = s.logs.findIndex((l) => l.plantId === a.plantId && l.type === a.type && sameLocalDay(l.date, now));
      if (idx < 0) return s;
      const logs = s.logs.filter((_, i) => i !== idx);
      const plants = s.plants.map((p) => p.id !== a.plantId ? p : {
        ...p, care: p.care.map((c) => c.type !== a.type || !c.prevLast ? c : { ...c, last: c.prevLast, prevLast: undefined }),
      });
      return { ...s, plants, logs };
    }
    case 'snooze': {
      const until = new Date(now.getTime() + a.hours * 3_600_000).toISOString();
      return { ...s, plants: s.plants.map((p) => p.id !== a.plantId ? p : { ...p, care: p.care.map((c) => c.type === a.type ? { ...c, snoozedUntil: until } : c) }) };
    }
    case 'skip':
      return { ...s, plants: s.plants.map((p) => p.id !== a.plantId ? p : { ...p, care: p.care.map((c) => c.type === a.type ? { ...c, last: now.toISOString(), snoozedUntil: undefined } : c) }) };
    case 'addPlant': return { ...s, plants: [a.plant, ...s.plants] };
    case 'updatePlant': return { ...s, plants: s.plants.map((p) => p.id === a.id ? { ...p, ...a.patch } : p) };
    case 'setInterval':
      return { ...s, plants: s.plants.map((p) => p.id !== a.id ? p : { ...p, care: p.care.map((c) => c.type === a.type ? { ...c, every: Math.max(1, a.every) } : c) }) };
    case 'deletePlant':
      return { ...s, plants: s.plants.filter((p) => p.id !== a.id), logs: s.logs.filter((l) => l.plantId !== a.id), journal: s.journal.filter((j) => j.plantId !== a.id) };
    case 'toggleMute': return { ...s, plants: s.plants.map((p) => p.id === a.id ? { ...p, muted: !p.muted } : p) };
    case 'toggleFav': return { ...s, plants: s.plants.map((p) => p.id === a.id ? { ...p, favorite: !p.favorite } : p) };
    case 'addLog': {
      const log: Log = { id: uid(), plantId: a.plantId, type: a.type, date: now.toISOString(), note: a.note };
      const plants = a.type === 'repot' ? s.plants.map((p) => p.id === a.plantId ? { ...p, repotted: now.toISOString() } : p) : s.plants;
      return { ...s, plants, logs: [log, ...s.logs] };
    }
    case 'deleteLog': return { ...s, logs: s.logs.filter((l) => l.id !== a.id) };
    case 'deleteJournal': return { ...s, journal: s.journal.filter((j) => j.id !== a.id) };
    case 'addJournal': return { ...s, journal: [a.entry, ...s.journal] };
    case 'settings': return { ...s, settings: { ...s.settings, ...a.patch } };
    case 'user': return { ...s, user: { ...s.user, ...a.patch } };
    case 'reset': return buildSeed();
    case 'sync': return { ...s, settings: { ...s.settings, lastSynced: now.toISOString() } };
  }
}

interface Ctx { state: AppState; dispatch: React.Dispatch<Action>; ready: boolean }
const StoreCtx = createContext<Ctx>(null as unknown as Ctx);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildSeed);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) dispatch({ t: 'hydrate', state: JSON.parse(raw) as AppState });
      } catch {}
      hydrated.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, ready }), [state, ready]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);
export { addDays };
