import React, { createContext, useContext, useMemo } from 'react';
import { TextStyle, ViewStyle, useColorScheme } from 'react-native';

const light = {
  bg: '#F7F5F0', surface: '#FFFFFF', surfaceLow: '#F0EEE9', surfaceMid: '#EAE8E3',
  text: '#1A2E1B', muted: '#4A5A4A', faint: '#72796E',
  primary: '#2C5F2D', primaryDark: '#134718', onPrimary: '#FFFFFF', accent: '#2C5F2D',
  sage: '#6B8F5C', terracotta: '#B98450', tint: '#EAEFE8', chip: '#EFECE4', border: '#E3DED2', divider: '#E8E3D7',
  mint: '#C3EBB0', mintSoft: '#E4F3DC', onMint: '#2E4F23',
  healthy: '#2E7D47', amber: '#D9822B', amberBg: 'rgba(217,130,43,0.14)', amberText: '#9C5B18',
  coral: '#C85A48', coralBg: 'rgba(200,90,72,0.14)', coralText: '#A33F2F', danger: '#BA1A1A', dangerBg: '#FFE3DF',
  water: '#4F86B8', waterBg: '#DDEBF7', sun: '#F3B27A', sunBg: '#FDE7D3', soil: '#5B3406', soilBg: '#E7DFD6',
  overlay: 'rgba(26,46,27,0.45)', shadow: '#2C281E',
};
export type Palette = { [K in keyof typeof light]: string };
const dark: Palette = {
  bg: '#121812', surface: '#1C241C', surfaceLow: '#252E25', surfaceMid: '#2E382E',
  text: '#E8EFE4', muted: '#A9B8A5', faint: '#869283',
  primary: '#3C7A3E', primaryDark: '#2F6B31', onPrimary: '#FFFFFF', accent: '#9CD596',
  sage: '#8FB580', terracotta: '#D39C66', tint: '#26342A', chip: '#2A332A', border: '#34403A', divider: '#2C362C',
  mint: '#3A5A33', mintSoft: '#243526', onMint: '#C3EBB0',
  healthy: '#6FCF8E', amber: '#F0A04F', amberBg: 'rgba(240,160,79,0.18)', amberText: '#F2B574',
  coral: '#E58A78', coralBg: 'rgba(229,138,120,0.18)', coralText: '#F0A394', danger: '#FFB4AB', dangerBg: '#3E2420',
  water: '#7FB1DE', waterBg: '#243746', sun: '#F3B27A', sunBg: '#43321F', soil: '#E3B98A', soilBg: '#3A322A',
  overlay: 'rgba(0,0,0,0.6)', shadow: '#000000',
};

export const fonts = {
  reg: 'PlusJakartaSans_400Regular',
  med: 'PlusJakartaSans_500Medium',
  semi: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  xbold: 'PlusJakartaSans_800ExtraBold',
};

export const type = {
  display: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 40, letterSpacing: -0.6 },
  h1: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 34, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.semi, fontSize: 20, lineHeight: 28 },
  h3: { fontFamily: fonts.semi, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.reg, fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: fonts.reg, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.semi, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  labelSm: { fontFamily: fonts.semi, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  micro: { fontFamily: fonts.med, fontSize: 11, lineHeight: 14, letterSpacing: 0.3 },
} satisfies Record<string, TextStyle>;
export type Variant = keyof typeof type;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };

export function shadow(c: Palette, level: 1 | 2 | 3 = 1): ViewStyle {
  const dk = c.bg === dark.bg;
  const o = [0, 0.05, 0.1, 0.14][level] * (dk ? 3 : 1);
  return { shadowColor: c.shadow, shadowOpacity: o, shadowRadius: [0, 10, 18, 26][level], shadowOffset: { width: 0, height: [0, 3, 8, 12][level] }, elevation: [0, 2, 5, 8][level] };
}

interface ThemeCtx { c: Palette; isDark: boolean }
const Ctx = createContext<ThemeCtx>({ c: light, isDark: false });

export function ThemeProvider({ mode, children }: { mode: 'light' | 'dark' | 'system'; children: React.ReactNode }) {
  const sys = useColorScheme();
  const isDark = mode === 'dark' || (mode === 'system' && sys === 'dark');
  const value = useMemo(() => ({ c: isDark ? dark : light, isDark }), [isDark]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useTheme = () => useContext(Ctx);
