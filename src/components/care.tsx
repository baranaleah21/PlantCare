import { Palette } from '../theme';
import { CareType, fmtWater, LogType, Plant, Units } from '../logic';

export function careMeta(c: Palette): Record<LogType, { icon: string; bg: string; fg: string; label: string }> {
  return {
    water: { icon: 'water-outline', bg: c.waterBg, fg: c.water, label: 'Water' },
    fertilize: { icon: 'sprout', bg: c.mint, fg: c.onMint, label: 'Fertilize' },
    mist: { icon: 'spray', bg: c.mintSoft, fg: c.healthy, label: 'Mist' },
    rotate: { icon: 'white-balance-sunny', bg: c.sunBg, fg: c.amber, label: 'Sunlight' },
    repot: { icon: 'shovel', bg: c.soilBg, fg: c.soil, label: 'Repot' },
    prune: { icon: 'content-cut', bg: c.soilBg, fg: c.soil, label: 'Prune' },
  };
}

export function taskLabel(type: CareType, p: Plant, units: Units): string {
  switch (type) {
    case 'water': return `Watering (${fmtWater(p.waterMl, units)} deep soak)`;
    case 'fertilize': return 'Liquid Fertilizer (half-strength)';
    case 'mist': return 'Gentle mist for humidity';
    case 'rotate': return 'Rotate 90° for balanced sunlight';
  }
}

export const TIPS = [
  'Wipe dust off your Monstera leaves with a damp cloth to boost sunlight absorption and unclog pore stomata.',
  'Water in the morning so leaves and soil have all day to dry. It keeps fungus gnats away.',
  'Cooler mornings mean slower growth. Always check soil moisture 2 inches deep before watering.',
  'Rotate plants a quarter turn each week so they grow evenly instead of leaning toward the window.',
  'Yellow lower leaves are often overwatering. Let the soil dry a little longer next cycle.',
  'Group humidity-lovers like Calathea together. They create a little microclimate.',
  'Use room-temperature water. Cold water can shock tropical roots.',
];
export const tipOfTheDay = () => TIPS[Math.floor(Date.now() / 86_400_000) % TIPS.length];
