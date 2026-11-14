import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PlantCareProvider, usePlantCare } from '../context/PlantCareContext';
import { ThemeProvider, useTheme } from '../theme';
import { ToastProvider } from '../components/ui';
import ConfirmHost from '../components/ConfirmHost';
import { useFonts } from '../fonts';
import { rescheduleAll } from '../notifications';

const PUBLIC = ['login', 'signup', 'forgot-password'];

function Gate() {
  const { c, isDark } = useTheme();
  const { state, ready } = usePlantCare();
  const [fontsLoaded, fontError] = useFonts();
  const segments = useSegments();
  const router = useRouter();
  const s = state.settings;
  const loaded = ready && (fontsLoaded || !!fontError);

  // Auth guard: signed-out users only see the public screens, signed-in users skip them.
  useEffect(() => {
    if (!loaded) return;
    const first = (segments[0] as string | undefined) ?? '';
    const onPublic = PUBLIC.includes(first);
    if (!state.authed && !onPublic) router.replace('/login');
    else if (state.authed && (onPublic || first === '')) router.replace('/home');
  }, [loaded, state.authed, segments]);

  // Keep OS reminders in sync with plants + settings.
  useEffect(() => {
    if (!loaded || !state.authed) return;
    const t = setTimeout(() => rescheduleAll(state.plants, s), 800);
    return () => clearTimeout(t);
  }, [loaded, state.authed, state.plants, s.push, s.frequency, s.sound, s.quiet, s.quietFrom, s.quietTo, s.types]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={c.primary} /></View>;
  }
  // On web, show the app inside a phone-width column so it looks like it does on a device.
  const web = Platform.OS === 'web';
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: web ? '#1B1C19' : c.bg }}>
      <View style={{ flex: 1, width: '100%', maxWidth: web ? 430 : undefined, backgroundColor: c.bg, overflow: 'hidden' }}>
        <ToastProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <ConfirmHost />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
            <Stack.Screen name="add-plant" options={{ presentation: 'modal' }} />
            <Stack.Screen name="care-session" options={{ presentation: 'modal' }} />
          </Stack>
        </ToastProvider>
      </View>
    </View>
  );
}

function Themed() {
  const { state } = usePlantCare();
  return <ThemeProvider mode={state.settings.theme}><Gate /></ThemeProvider>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PlantCareProvider>
        <Themed />
      </PlantCareProvider>
    </SafeAreaProvider>
  );
}
