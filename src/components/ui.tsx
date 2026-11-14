import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated, Image, KeyboardAvoidingView, Modal, Platform, Pressable,
  Text as RNText,
  ScrollView, StyleProp,
  StyleSheet,
  Switch,
  TextInput, TextStyle, View, ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useStore } from '../store';
import { fonts, radius, shadow, type, useTheme, Variant } from '../theme';

// ---------------------------------------------------------------- Text / Icon
export function Txt({ v = 'body', color, style, children, ...rest }: {
  v?: Variant; color?: string; style?: StyleProp<TextStyle>; children?: React.ReactNode; numberOfLines?: number; onPress?: () => void;
}) {
  const { c } = useTheme();
  return <RNText {...rest} style={[type[v], { color: color ?? c.text }, style]}>{children}</RNText>;
}

export function Icon({ name, size = 22, color }: { name: string; size?: number; color?: string }) {
  const { c } = useTheme();
  return <MaterialCommunityIcons name={name as any} size={size} color={color ?? c.text} />;
}

// -------------------------------------------------------------------- Surfaces
export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const { c } = useTheme();
  const base: ViewStyle = { backgroundColor: c.surface, borderRadius: radius.xl, padding: 16, ...shadow(c, 1) };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return <Pressable onPress={onPress} style={({ pressed }) => [base, style, pressed && { transform: [{ scale: 0.985 }] }]}>{children}</Pressable>;
}

export function Screen({ children, scroll = true, edges = ['top'], padBottom = 24, refreshable }: {
  children: React.ReactNode; scroll?: boolean; edges?: ('top' | 'bottom')[]; padBottom?: number; refreshable?: never;
}) {
  const { c } = useTheme();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: c.bg }}>
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: padBottom }}>
          {children}
        </ScrollView>
      ) : children}
    </SafeAreaView>
  );
}

export const PAD = 20;

// ------------------------------------------------------------------- Pictures
export function PlantPhoto({ uri, style, rounded = 16 }: { uri?: string; style?: StyleProp<ViewStyle>; rounded?: number }) {
  const { c } = useTheme();
  const [failed, setFailed] = useState(false);
  return (
    <View style={[{ backgroundColor: c.mintSoft, borderRadius: rounded, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, style]}>
      {uri && !failed ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setFailed(true)} />
      ) : (
        <Icon name="sprout" size={28} color={c.sage} />
      )}
    </View>
  );
}

export function Avatar({ uri, size = 36, onPress }: { uri?: string; size?: number; onPress?: () => void }) {
  const { c } = useTheme();
  const [failed, setFailed] = useState(false);
  const inner = (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.mint, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      {uri && !failed ? <Image source={{ uri }} style={StyleSheet.absoluteFill} onError={() => setFailed(true)} /> : <Icon name="account" size={size * 0.6} color={c.onMint} />}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} hitSlop={8}>{inner}</Pressable> : inner;
}

export function LogoMark({ size = 36 }: { size?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: c.mint, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="sprout" size={size * 0.62} color={c.primary} />
    </View>
  );
}

export function IconDisc({ name, bg, color, size = 44 }: { name: string; bg: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={size * 0.5} color={color} />
    </View>
  );
}

// -------------------------------------------------------------------- Controls
type BtnVariant = 'primary' | 'secondary' | 'clay' | 'danger' | 'ghost' | 'outline';
export function Btn({ label, onPress, variant = 'primary', icon, iconRight, disabled, style, small }: {
  label: string; onPress?: () => void; variant?: BtnVariant; icon?: string; iconRight?: string; disabled?: boolean; style?: StyleProp<ViewStyle>; small?: boolean;
}) {
  const { c } = useTheme();
  const map: Record<BtnVariant, { bg: string; fg: string; sh?: boolean; border?: string }> = {
    primary: { bg: c.primaryDark, fg: c.onPrimary, sh: true },
    secondary: { bg: c.tint, fg: c.accent },
    clay: { bg: c.terracotta, fg: '#fff', sh: true },
    danger: { bg: c.dangerBg, fg: c.danger },
    ghost: { bg: 'transparent', fg: c.accent },
    outline: { bg: c.surface, fg: c.accent, border: c.border },
  };
  const m = map[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        { minHeight: small ? 40 : 52, paddingHorizontal: small ? 16 : 22, borderRadius: radius.pill, backgroundColor: m.bg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: disabled ? 0.5 : 1 },
        m.border ? { borderWidth: 1, borderColor: m.border } : null,
        m.sh ? { ...shadow(c, 2), shadowColor: c.primary } : null,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={small ? 18 : 20} color={m.fg} /> : null}
      <Txt v={small ? 'labelSm' : 'label'} color={m.fg} style={{ fontFamily: fonts.bold }}>{label}</Txt>
      {iconRight ? <Icon name={iconRight} size={small ? 18 : 20} color={m.fg} /> : null}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: string }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{
      flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, height: 40, borderRadius: radius.pill,
      backgroundColor: selected ? c.primaryDark : c.chip, opacity: pressed ? 0.85 : 1,
    }]}>
      {icon ? <Icon name={icon} size={16} color={selected ? '#fff' : c.accent} /> : null}
      <Txt v="label" color={selected ? '#fff' : c.muted}>{label}</Txt>
    </Pressable>
  );
}

export function Tag({ label, tone = 'neutral', icon, style }: { label: string; tone?: 'amber' | 'green' | 'coral' | 'neutral'; icon?: string; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const t = { amber: [c.amberBg, c.amberText], green: [c.mint, c.onMint], coral: [c.coralBg, c.coralText], neutral: [c.surfaceMid, c.muted] }[tone];
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: t[0], paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, alignSelf: 'flex-start' }, style]}>
      {icon ? <Icon name={icon} size={13} color={t[1]} /> : null}
      <Txt v="labelSm" color={t[1]} numberOfLines={1}>{label}</Txt>
    </View>
  );
}

export function Segmented<T extends string>({ options, value, onChange, dense }: { options: { key: T; label: string }[]; value: T; onChange: (k: T) => void; dense?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: c.surfaceLow, borderRadius: radius.pill, padding: 4 }}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} style={{ flex: 1, height: dense ? 36 : 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.primary : 'transparent' }}>
            <Txt v="label" color={on ? '#fff' : c.muted} style={{ fontSize: dense ? 13 : 14 }}>{o.label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { c } = useTheme();
  return <Switch value={value} onValueChange={onChange} trackColor={{ false: c.surfaceMid, true: c.primary }} thumbColor="#fff" ios_backgroundColor={c.surfaceMid} />;
}

export function CheckCircle({ done, onPress }: { done: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([Animated.timing(scale, { toValue: 0.82, duration: 70, useNativeDriver: true }), Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true })]).start();
    onPress();
  };
  return (
    <Pressable onPress={press} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked: done }}>
      <Animated.View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? c.primary : c.surfaceLow, transform: [{ scale }] }}>
        {done ? <Icon name="check" size={22} color="#fff" /> : <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: c.faint }} />}
      </Animated.View>
    </Pressable>
  );
}

export function Ring({ value, total, size = 56 }: { value: number; total: number; size?: number }) {
  const { c } = useTheme();
  const stroke = 6, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const frac = total ? Math.min(1, value / total) : 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.surfaceMid} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.primary} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${circ * frac} ${circ}`} />
      </Svg>
      <Txt v="label" style={{ fontFamily: fonts.bold }}>{value}/{total}</Txt>
    </View>
  );
}

export function ProgressBar({ pct, color }: { pct: number; color?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: c.surfaceMid, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: 8, borderRadius: 4, backgroundColor: color ?? c.primary }} />
    </View>
  );
}

export function Field({ icon, rightIcon, onRight, error, ...rest }: {
  icon?: string; rightIcon?: string; onRight?: () => void; error?: string;
} & React.ComponentProps<typeof TextInput>) {
  const { c } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 14, borderRadius: radius.lg, backgroundColor: c.surfaceLow, borderWidth: 2, borderColor: error ? c.danger : focus ? c.primary : 'transparent' }}>
        {icon ? <Icon name={icon} size={20} color={c.faint} /> : null}
        <TextInput
          placeholderTextColor={c.faint}
          {...rest}
          onFocus={(e: any) => { setFocus(true); rest.onFocus?.(e); }}
          onBlur={(e: any) => { setFocus(false); rest.onBlur?.(e); }}
          style={[{ flex: 1, fontFamily: fonts.med, fontSize: 15, color: c.text, paddingVertical: 12 }, rest.style as any]}
        />
        {rightIcon ? <Pressable onPress={onRight} hitSlop={10}><Icon name={rightIcon} size={20} color={c.faint} /></Pressable> : null}
      </View>
      {error ? <Txt v="bodySm" color={c.danger} style={{ marginTop: 4, marginLeft: 6 }}>{error}</Txt> : null}
    </View>
  );
}

// -------------------------------------------------------------------- Layout bits
export function TopBar({ title, onBack, right, navigation }: { title: string; onBack?: () => void; right?: React.ReactNode; navigation?: any }) {
  const { state } = useStore();
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD, height: 60, gap: 10 }}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={10} accessibilityLabel="Go back" style={{ marginLeft: -6 }}><Icon name="chevron-left" size={30} /></Pressable>
      ) : null}
      <LogoMark />
      {onBack ? (
        <Txt v="h3" style={{ flex: 1 }} numberOfLines={1}>{title}</Txt>
      ) : (
        <>
          <Txt v="h2" color={c.accent} style={{ flex: 1, fontFamily: fonts.bold }}>PlantCare</Txt>
          <Txt v="label" color={c.muted}>{title}</Txt>
        </>
      )}
      {right}
      <Avatar uri={state.user.avatar} onPress={() => navigation?.navigate?.('Tabs', { screen: 'Profile' })} />
    </View>
  );
}

export function SectionTitle({ title, count, right, onRight }: { title: string; count?: string | number; right?: string; onRight?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12, paddingHorizontal: PAD }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
        <Txt v="h2">{title}</Txt>
        {count !== undefined ? <Txt v="label" color={c.muted}>({count})</Txt> : null}
      </View>
      {right ? <Pressable onPress={onRight} hitSlop={8}><Txt v="label" color={c.accent}>{right}</Txt></Pressable> : null}
    </View>
  );
}

export function Empty({ icon = 'sprout-outline', title, sub }: { icon?: string; title: string; sub?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: 32, gap: 8 }}>
      <IconDisc name={icon} bg={c.mintSoft} color={c.sage} size={64} />
      <Txt v="h3" style={{ textAlign: 'center' }}>{title}</Txt>
      {sub ? <Txt v="bodySm" color={c.muted} style={{ textAlign: 'center' }}>{sub}</Txt> : null}
    </View>
  );
}

// ------------------------------------------------------------------ Bottom sheet
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: c.overlay }]} accessibilityLabel="Close" />
        <View style={{ backgroundColor: c.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 20 + insets.bottom, maxHeight: '88%',    width: '100%', maxWidth: 430, alignSelf: 'center', ...shadow(c, 3) }}>
          <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, marginBottom: 14 }} />
          {title ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Txt v="h2">{title}</Txt>
              <Pressable onPress={onClose} hitSlop={10}><Icon name="close" size={24} color={c.muted} /></Pressable>
            </View>
          ) : null}
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function OptionRow({ label, sub, selected, onPress, icon }: { label: string; sub?: string; selected?: boolean; onPress: () => void; icon?: string }) {
  const { c } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 14, borderRadius: radius.lg, backgroundColor: selected ? c.mintSoft : pressed ? c.surfaceLow : 'transparent', marginBottom: 4 })}>
      {icon ? <Icon name={icon} size={22} color={c.accent} /> : null}
      <View style={{ flex: 1 }}>
        <Txt v="label">{label}</Txt>
        {sub ? <Txt v="bodySm" color={c.muted}>{sub}</Txt> : null}
      </View>
      {selected ? <Icon name="check-circle" size={22} color={c.primary} /> : null}
    </Pressable>
  );
}

// ------------------------------------------------------------------------ Toast
const ToastCtx = createContext<(msg: string, icon?: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<{ text: string; icon?: string } | null>(null);
  const op = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const show = useCallback((text: string, icon?: string) => {
    setMsg({ text, icon });
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(op, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    timer.current = setTimeout(() => Animated.timing(op, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setMsg(null)), 2200);
  }, [op]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg ? (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 20, right: 20, bottom: 96 + insets.bottom * 0, opacity: op, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.text, paddingHorizontal: 18, paddingVertical: 12, borderRadius: radius.pill, ...shadow(c, 3) }}>
            {msg.icon ? <Icon name={msg.icon} size={18} color={c.bg} /> : null}
            <Txt v="label" color={c.bg}>{msg.text}</Txt>
          </View>
        </Animated.View>
      ) : null}
    </ToastCtx.Provider>
  );
}
