import { IMG } from './images';
import { addDays, CareItem, CareType, Log, Plant, JournalEntry, Light } from '../logic';

export interface UserProfile { name: string; email: string; avatar?: string; since: string }
export interface Settings {
  push: boolean;
  frequency: 'adaptive' | 'daily' | 'weekly';
  sound: 'chime' | 'rain' | 'birdsong' | 'silent';
  quiet: boolean;
  quietFrom: string;
  quietTo: string;
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  lastSynced: string;
  types: Record<CareType, boolean>;
}
export interface AppState {
  authed: boolean;
  user: UserProfile;
  settings: Settings;
  plants: Plant[];
  logs: Log[];
  journal: JournalEntry[];
}

export const DEFAULT_SETTINGS: Settings = {
  push: true, frequency: 'adaptive', sound: 'chime', quiet: true, quietFrom: '10:00 PM', quietTo: '8:00 AM',
  units: 'metric', theme: 'light', lastSynced: new Date().toISOString(),
  types: { water: true, fertilize: true, mist: true, rotate: true },
};

const iso = (daysAgo: number, h = 9, m = 0) => {
  const d = addDays(new Date(), -daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const ci = (type: CareType, every: number, daysAgo: number, detail: string): CareItem => ({ type, every, last: iso(daysAgo), detail });

interface Seed { id: string; name: string; species: string; family: string; room: string; image: string; light: Light; waterMl: number; care: CareItem[]; fav?: boolean; repot: number }
const SEEDS: Seed[] = [
  { id: 'p1', name: 'Monstera', species: 'Monstera deliciosa', family: 'Araceae', room: 'Living Room', image: IMG.monstera, light: 'bright', waterMl: 350, fav: true, repot: 240,
    care: [ci('water', 7, 7, 'Deep soak with filtered water'), ci('fertilize', 14, 9, 'Balanced 10-10-10 liquid feed, half strength')] },
  { id: 'p2', name: 'Fiddle Leaf Fig', species: 'Ficus lyrata', family: 'Moraceae', room: 'Balcony', image: IMG.fiddle, light: 'bright', waterMl: 400, repot: 300,
    care: [ci('water', 7, 4, 'Water when top 2 inches are dry'), ci('rotate', 7, 7, 'Rotate 90° for balanced sunlight')] },
  { id: 'p3', name: 'Snake Plant', species: 'Sansevieria trifasciata', family: 'Asparagaceae', room: 'Bedroom', image: IMG.snake, light: 'low', waterMl: 200, repot: 500,
    care: [ci('water', 14, 6, 'Let soil dry out fully between drinks'), ci('mist', 7, 0, 'Gentle foliage mist')] },
  { id: 'p4', name: 'Calathea', species: 'Calathea orbifolia', family: 'Marantaceae', room: 'Bathroom', image: IMG.calathea, light: 'medium', waterMl: 250, repot: 400,
    care: [ci('water', 7, 3, 'Filtered or rainwater only'), ci('mist', 2, 2, 'Gentle mist for humidity boost')] },
  { id: 'p5', name: 'Golden Pothos', species: 'Epipremnum aureum', family: 'Araceae', room: 'Kitchen', image: IMG.pothos, light: 'medium', waterMl: 200, repot: 380,
    care: [ci('water', 7, 6, 'Soak until droplets reach the saucer'), ci('fertilize', 14, 14, 'Liquid fertilizer (half-strength)')] },
  { id: 'p6', name: 'Pilea', species: 'Pilea peperomioides', family: 'Urticaceae', room: 'Office', image: IMG.pilea, light: 'bright', waterMl: 150, repot: 200,
    care: [ci('water', 7, 7, 'Light drink, avoid soggy soil')] },
  { id: 'p7', name: 'Rubber Tree', species: 'Ficus elastica', family: 'Moraceae', room: 'Study', image: IMG.rubber, light: 'bright', waterMl: 300, repot: 4,
    care: [ci('water', 10, 5, 'Deep soak, drain fully')] },
  { id: 'p8', name: 'Basil & Mint', species: 'Ocimum basilicum', family: 'Lamiaceae', room: 'Kitchen', image: IMG.herbs, light: 'direct', waterMl: 120, repot: 150,
    care: [ci('water', 3, 2, 'Keep soil evenly moist'), ci('fertilize', 21, 12, 'Liquid seaweed formula')] },
];

export function buildSeed(): AppState {
  const plants: Plant[] = SEEDS.map((s) => ({
    id: s.id, name: s.name, species: s.species, family: s.family, room: s.room, image: s.image, light: s.light,
    care: s.care, favorite: !!s.fav, addedAt: iso(300), repotted: iso(s.repot), repotEveryMonths: 15, waterMl: s.waterMl,
  }));
  // Derive a realistic history from each care item's cadence.
  const logs: Log[] = [];
  let n = 0;
  for (const s of SEEDS) {
    for (const c of s.care) {
      const lastAgo = Math.round((Date.now() - new Date(c.last).getTime()) / 86_400_000);
      for (let k = 0, ago = lastAgo; ago <= 30; k++, ago += c.every) {
        if (ago === 0) continue; // today's log is added explicitly below
        logs.push({ id: `seed${n++}`, plantId: s.id, type: c.type, date: iso(ago, 8 + (n % 9), (n * 7) % 60) });
      }
    }
  }
  logs.push({ id: 'seed-mist-today', plantId: 'p3', type: 'mist', date: iso(0, 8, 30) });
  logs.push({ id: 'seed-repot', plantId: 'p7', type: 'repot', date: iso(4, 14, 15), note: 'Added fresh perlite soil mix' });
  const journal: JournalEntry[] = [
    { id: 'j1', plantId: 'p1', title: 'Spring Flush Unfurling', text: 'Grew 2 new fenestrated leaves this month! Both unfurled with 4 holes each. Looking extremely vibrant after adding the moss pole support.', date: iso(2) },
  ];
  return {
    authed: false,
    user: { name: 'Mia Lindqvist', email: 'mia.gardens@sanctuary.com', avatar: IMG.avatar, since: 'March 2023' },
    settings: { ...DEFAULT_SETTINGS },
    plants, logs, journal,
  };
}

export const JOURNAL_PHOTOS = [IMG.journal1, IMG.journal2];
