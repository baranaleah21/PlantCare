import { IMG } from './images';
import { Light } from '../logic';

export interface Species {
  name: string; common: string; family: string; light: Light; waterEvery: number; fertEvery: number; waterMl: number; tip: string; image?: string;
}
export const SPECIES: Species[] = [
  { name: 'Monstera Deliciosa', common: 'Swiss Cheese Plant', family: 'Araceae', light: 'bright', waterEvery: 7, fertEvery: 14, waterMl: 350, tip: 'Allow the top 2 inches of soil to dry out between deep soakings.', image: IMG.monsteraHero },
  { name: 'Monstera Adansonii', common: 'Monkey Mask', family: 'Trailing', light: 'bright', waterEvery: 7, fertEvery: 14, waterMl: 250, tip: 'Loves a moss pole and humidity.', image: IMG.adansonii },
  { name: 'Ficus Lyrata', common: 'Fiddle Leaf Fig', family: 'Moraceae', light: 'bright', waterEvery: 7, fertEvery: 21, waterMl: 400, tip: 'Hates being moved. Rotate quarterly for even growth.', image: IMG.fiddle },
  { name: 'Sansevieria Trifasciata', common: 'Snake Plant', family: 'Asparagaceae', light: 'low', waterEvery: 14, fertEvery: 60, waterMl: 200, tip: 'Nearly indestructible. Overwatering is the only real danger.', image: IMG.snake },
  { name: 'Calathea Orbifolia', common: 'Prayer Plant', family: 'Marantaceae', light: 'medium', waterEvery: 5, fertEvery: 30, waterMl: 250, tip: 'Use filtered water and keep humidity high.', image: IMG.calathea },
  { name: 'Epipremnum Aureum', common: 'Golden Pothos', family: 'Araceae', light: 'medium', waterEvery: 7, fertEvery: 30, waterMl: 200, tip: 'Droops dramatically when thirsty, then bounces back.', image: IMG.pothos },
  { name: 'Pilea Peperomioides', common: 'Chinese Money Plant', family: 'Urticaceae', light: 'bright', waterEvery: 7, fertEvery: 30, waterMl: 150, tip: 'Turn weekly so it grows evenly.', image: IMG.pilea },
  { name: 'Ficus Elastica', common: 'Rubber Tree', family: 'Moraceae', light: 'bright', waterEvery: 10, fertEvery: 30, waterMl: 300, tip: 'Wipe leaves regularly to keep them glossy.', image: IMG.rubber },
  { name: 'Olea Europaea', common: 'Indoor Olive', family: 'Oleaceae', light: 'direct', waterEvery: 10, fertEvery: 30, waterMl: 300, tip: 'Needs as much sun as you can give it.', image: IMG.olive },
  { name: 'Zamioculcas Zamiifolia', common: 'ZZ Plant', family: 'Araceae', light: 'low', waterEvery: 14, fertEvery: 60, waterMl: 200, tip: 'Stores water in its rhizomes. Err on the dry side.' },
  { name: 'Spathiphyllum Wallisii', common: 'Peace Lily', family: 'Araceae', light: 'medium', waterEvery: 6, fertEvery: 30, waterMl: 300, tip: 'Will droop when thirsty; a great communicator.' },
  { name: 'Aloe Vera', common: 'Aloe', family: 'Asphodelaceae', light: 'direct', waterEvery: 14, fertEvery: 90, waterMl: 150, tip: 'Succulent soil and plenty of sun.' },
  { name: 'Chlorophytum Comosum', common: 'Spider Plant', family: 'Asparagaceae', light: 'medium', waterEvery: 7, fertEvery: 30, waterMl: 200, tip: 'Produces baby plantlets you can propagate.' },
  { name: 'Ocimum Basilicum', common: 'Basil', family: 'Lamiaceae', light: 'direct', waterEvery: 3, fertEvery: 21, waterMl: 120, tip: 'Pinch flowers to keep leaves coming.' },
];

export const ROOMS = ['Living Room', 'Bedroom', 'Office', 'Balcony', 'Kitchen', 'Bathroom', 'Study'];

export const LIGHTS: { key: Light; label: string; sub: string; icon: string }[] = [
  { key: 'direct', label: 'Direct Sun', sub: '6+ hours intense direct ray', icon: 'white-balance-sunny' },
  { key: 'bright', label: 'Bright Indirect', sub: 'Filtered ambient daylight', icon: 'weather-partly-cloudy' },
  { key: 'medium', label: 'Medium Light', sub: 'A few feet from window', icon: 'weather-sunny-off' },
  { key: 'low', label: 'Low Light', sub: 'North facing or shade', icon: 'weather-night' },
];
export const lightLabel = (l: Light) => LIGHTS.find((x) => x.key === l)!.label;

export const POTS = ['Small (10-15 cm)', 'Medium (16-22 cm)', 'Large (23-30 cm)', 'Extra large (30+ cm)'];
export const SOILS = ['Chunky aroid mix', 'Standard potting mix', 'Cactus & succulent mix', 'Peat-free blend', 'Orchid bark'];
