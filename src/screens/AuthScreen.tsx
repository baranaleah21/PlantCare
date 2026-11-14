import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Btn, Card, Field, LogoMark, PAD, Txt, useToast } from '../components/ui';
import { fonts, radius, useTheme } from '../theme';
import { useStore } from '../store';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pretty = (email: string) => email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

export default function AuthScreen({ initialMode = 'in' }: { initialMode?: 'in' | 'up' }) {
  const router = useRouter();
  const { c } = useTheme();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [mode, setMode] = useState<'in' | 'up'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [errs, setErrs] = useState<{ name?: string; email?: string; pw?: string }>({});

  const submit = () => {
    const e: typeof errs = {};
    if (mode === 'up' && name.trim().length < 2) e.name = 'Tell us what to call you.';
    if (!EMAIL_RE.test(email.trim())) e.email = 'Enter a valid email address.';
    if (pw.length < 6) e.pw = 'Use at least 6 characters.';
    setErrs(e);
    if (Object.keys(e).length) return;
    const clean = email.trim().toLowerCase();
    dispatch({ t: 'login', email: clean, name: mode === 'up' ? name.trim() : clean === state.user.email ? undefined : pretty(clean) });
  };
  const social = (who: string) => {
    toast(`Signed in with ${who} (demo)`, 'leaf');
    dispatch({ t: 'login', email: state.user.email });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: PAD, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: c.mintSoft }}>
              <LogoMark size={64} />
            </View>
            <Txt v="display" color={c.accent} style={{ marginTop: 12 }}>PlantCare</Txt>
            <Txt v="h3" color={c.accent} style={{ marginTop: 4 }}>Healthy Plants, Happy You.</Txt>
            <Txt v="bodySm" color={c.muted} style={{ textAlign: 'center', marginTop: 6, maxWidth: 280 }}>Nurture your indoor jungle with gentle, mindful care rituals.</Txt>
          </View>

          <Card style={{ marginTop: 24, padding: 20, gap: 14 }}>
            {mode === 'up' ? (
              <View style={{ gap: 6 }}>
                <Txt v="labelSm" color={c.muted}>Your name</Txt>
                <Field icon="account-outline" placeholder="Mia" value={name} onChangeText={setName} error={errs.name} autoCapitalize="words" />
              </View>
            ) : null}
            <View style={{ gap: 6 }}>
              <Txt v="labelSm" color={c.muted}>Email Address</Txt>
              <Field icon="email-outline" placeholder="you@sanctuary.com" value={email} onChangeText={setEmail} error={errs.email} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
            </View>
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Txt v="labelSm" color={c.muted}>Password</Txt>
                {mode === 'in' ? <Pressable onPress={() => router.push('/forgot-password')}><Txt v="micro" color={c.accent}>Forgot password?</Txt></Pressable> : null}
              </View>
              <Field icon="lock-outline" placeholder="••••••••" value={pw} onChangeText={setPw} error={errs.pw} secureTextEntry={!show} rightIcon={show ? 'eye-off-outline' : 'eye-outline'} onRight={() => setShow((s) => !s)} autoCapitalize="none" onSubmitEditing={submit} />
            </View>
            <Btn label={mode === 'in' ? 'Sign In' : 'Create Account'} iconRight="arrow-right" onPress={submit} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
              <Txt v="micro" color={c.faint}>OR CONTINUE WITH</Txt>
              <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
            </View>
            <Btn label="Continue with Google" variant="secondary" icon="google" onPress={() => social('Google')} style={{ backgroundColor: c.surfaceLow }} />
            <Btn label="Continue with Apple" variant="secondary" icon="apple" onPress={() => social('Apple')} style={{ backgroundColor: c.surfaceLow }} />
          </Card>

          <View style={{ marginTop: 20, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: c.surfaceLow }}>
            <Txt v="bodySm" color={c.muted}>Take a breath. Your monstera misses you.</Txt>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 24 }}>
            <Txt v="body" color={c.muted}>{mode === 'in' ? "Don't have an account?" : 'Already have an account?'}</Txt>
            <Pressable onPress={() => (mode === 'in' ? router.push('/signup') : router.replace('/login'))}>
              <Txt v="body" color={c.accent} style={{ fontFamily: fonts.bold }}>{mode === 'in' ? 'Sign up' : 'Sign in'}</Txt>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
