// Pure scheduling + stats logic (no React / React Native imports so it is easy to test).

export type CareType = 'water' | 'fertilize' | 'mist' | 'rotate';
export type LogType = CareType | 'repot' | 'prune';
export type Light = 'direct' | 'bright' | 'medium' | 'low';

export interface CareItem {
  type: CareType;
  every: number; // days
  last: string; // ISO of last completion
  prevLast?: string; // for undo
  snoozedUntil?: string;
  detail: string;
}

export interface Plant {
  id: string;
  name: string;
  species: string;
  family: string;
  room: string;
  image?: string;
  light: Light;
  care: CareItem[];
  favorite: boolean;
  addedAt: string;
  repotted: string; // ISO
  repotEveryMonths: number;
  waterMl: number;
  muted?: boolean;
  potSize?: string;
  soil?: string;
}

export interface Log {
  id: string;
  plantId: string;
  type: LogType;
  date: string; // ISO
  note?: string;
}

export interface JournalEntry {
  id: string;
  plantId: string;
  title: string;
  text: string;
  date: string;
  photos?: string[];
}

export const DAY = 86_400_000;

export const startOfDay = (d: Date | string | number) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
export const addDays = (d: Date | string | number, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const diffDays = (a: Date | string | number, b: Date | string | number) =>
  Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY);
export const isSameDay = (a: Date | string | number, b: Date | string | number) => diffDays(a, b) === 0;

export const nextDue = (item: CareItem) => addDays(startOfDay(item.last), item.every);

export interface Task {
  plantId: string;
  type: CareType;
  due: Date;
  overdueBy: number; // days (0 = due today)
  detail: string;
}

/** Tasks a plant collection has on `date`. For today this includes everything overdue (unless snoozed). */
export function tasksFor(plants: Plant[], date: Date, now: Date = new Date()): Task[] {
  const out: Task[] = [];
  const today = startOfDay(now);
  const target = startOfDay(date);
  const delta = diffDays(target, today);
  if (delta < 0) return out;
  for (const p of plants) {
    for (const it of p.care) {
      const due = nextDue(it);
      const dd = diffDays(due, today);
      if (delta === 0) {
        if (dd <= 0) {
          if (it.snoozedUntil && new Date(it.snoozedUntil) > now) continue;
          out.push({ plantId: p.id, type: it.type, due, overdueBy: -dd, detail: it.detail });
        }
      } else {
        // Future date: the cadence continues from the due date (or from today if already overdue,
        // assuming it gets done today).
        const start = dd <= 0 ? today : due;
        const k = diffDays(target, start);
        if ((dd > 0 ? k >= 0 : k > 0) && k % it.every === 0) {
          out.push({ plantId: p.id, type: it.type, due: target, overdueBy: 0, detail: it.detail });
        }
      }
    }
  }
  return out.sort((a, b) => b.overdueBy - a.overdueBy);
}

export const daysSince = (iso: string, now: Date = new Date()) => Math.max(0, diffDays(now, iso));

export function careItem(p: Plant, type: CareType) {
  return p.care.find((c) => c.type === type);
}

export type Status = 'needs-water' | 'low-mist' | 'healthy';

export function plantStatus(p: Plant, now: Date = new Date()): { status: Status; next: string; daysLeft: number } {
  const w = careItem(p, 'water');
  const m = careItem(p, 'mist');
  const wLeft = w ? diffDays(nextDue(w), now) : 99;
  const mLeft = m ? diffDays(nextDue(m), now) : 99;
  if (w && wLeft <= 0) return { status: 'needs-water', next: wLeft < 0 ? `${-wLeft}d overdue` : 'Today', daysLeft: wLeft };
  if (m && mLeft <= 0) return { status: 'low-mist', next: 'Mist today', daysLeft: mLeft };
  const left = Math.min(wLeft, mLeft);
  return { status: 'healthy', next: left === 1 ? 'Tomorrow' : `In ${left} days`, daysLeft: left };
}

/** Estimated soil moisture 0-100 based on how far through its watering cycle the plant is. */
export function moisture(p: Plant, now: Date = new Date()) {
  const w = careItem(p, 'water');
  if (!w) return 60;
  const frac = Math.min(1.2, daysSince(w.last, now) / w.every);
  return Math.max(5, Math.round(100 - frac * 70));
}

export function streak(logs: Log[], now: Date = new Date()) {
  const days = new Set(logs.map((l) => startOfDay(l.date).getTime()));
  let cursor = startOfDay(now);
  if (!days.has(cursor.getTime())) cursor = addDays(cursor, -1);
  let n = 0;
  while (days.has(cursor.getTime())) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

/** % of days this month (so far) with at least one care ritual logged. */
export function consistency(logs: Log[], now: Date = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const elapsed = now.getDate();
  const days = new Set(
    logs.filter((l) => { const d = new Date(l.date); return d.getFullYear() === y && d.getMonth() === m; }).map((l) => new Date(l.date).getDate()),
  );
  return Math.round((days.size / elapsed) * 100);
}

export function monthGrid(year: number, month: number): (Date | null)[][] {
  // Monday-first, matches the design.
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(addDays(first, i - lead));
  for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// ---- unit helpers -------------------------------------------------------
export type Units = 'metric' | 'imperial';
export const fmtWater = (ml: number, u: Units) => (u === 'metric' ? `${ml}ml` : `${(ml / 29.5735).toFixed(1).replace(/\.0$/, '')}oz`);
export const fmtTemp = (c: number, u: Units) => (u === 'metric' ? `${c}°C` : `${Math.round((c * 9) / 5 + 32)}°F`);

// ---- text helpers --------------------------------------------------------
export const CARE_LABEL: Record<LogType, string> = {
  water: 'Watering', fertilize: 'Fertilizing', mist: 'Misting', rotate: 'Rotating', repot: 'Repotting', prune: 'Pruning',
};

export function describeLog(l: Log, plant: Plant | undefined, units: Units): string {
  const ml = plant?.waterMl ?? 300;
  switch (l.type) {
    case 'water': return `Watered ${fmtWater(ml, units)}`;
    case 'fertilize': return 'Fertilized (half-strength)';
    case 'mist': return 'Morning mist completed';
    case 'rotate': return 'Rotated 90° for sunlight';
    case 'repot': return 'Repotted into fresh soil';
    case 'prune': return 'Pruned & tidied';
  }
}

export function toCsv(logs: Log[], plants: Plant[]) {
  const byId = new Map(plants.map((p) => [p.id, p]));
  const rows = ['date,plant,room,action,note'];
  for (const l of [...logs].sort((a, b) => +new Date(b.date) - +new Date(a.date))) {
    const p = byId.get(l.plantId);
    rows.push([new Date(l.date).toISOString(), p?.name ?? 'Deleted plant', p?.room ?? '', CARE_LABEL[l.type], l.note ?? ''].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','));
  }
  return rows.join('\n');
}

export function ago(iso: string, now: Date = new Date()) {
  const d = diffDays(now, iso);
  if (d <= 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)} week${d >= 14 ? 's' : ''} ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ageLabel(iso: string, now: Date = new Date()) {
  const months = Math.max(0, Math.floor(diffDays(now, iso) / 30.4));
  return months < 12 ? `${Math.max(1, months)}mo` : `${(months / 12).toFixed(1).replace(/\.0$/, '')}y`;
}

export const dueLabel = (daysLeft: number) => (daysLeft < 0 ? `${-daysLeft}d overdue` : daysLeft === 0 ? 'Due Today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} Days`);

export const LIGHT_HOURS: Record<Light, string> = { direct: '6-8+ hrs', bright: '4-6 hrs', medium: '2-4 hrs', low: '1-2 hrs' };
export const LIGHT_TEXT: Record<Light, string> = {
  direct: 'South or west window with strong rays. Great for sun lovers.',
  bright: 'North or east window with gentle morning rays; protect from midday direct scorch.',
  medium: 'A few feet back from a window. Happy with dappled daylight.',
  low: 'North-facing or shaded corners. Tolerates dim rooms.',
};
