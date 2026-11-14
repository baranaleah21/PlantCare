import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Btn, Card, Field, LogoMark, PAD, TopBar, Txt, useToast } from '../components/ui';
import { useTheme } from '../theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar title="Reset password" onBack={() => (router.canGoBack() ? router.back() : router.replace('/login'))} />
      <View style={{ padding: PAD, gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 8, marginTop: 12 }}>
          <LogoMark size={72} />
          <Txt v="h1" style={{ textAlign: 'center' }}>Reset your password</Txt>
          <Txt v="body" color={c.muted} style={{ textAlign: 'center' }}>We'll send a gentle link so you can choose a new password.</Txt>
        </View>
        <Card style={{ gap: 14 }}>
          <Field icon="email-outline" placeholder="you@sanctuary.com" value={email} onChangeText={(t) => { setEmail(t); setSent(false); }} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
          <Btn label={sent ? 'Link sent ✓' : 'Send reset link'} disabled={!EMAIL_RE.test(email.trim()) || sent} onPress={() => { setSent(true); toast(`Reset link sent to ${email.trim()} (demo)`, 'email-check-outline'); }} />
          <Btn label="Back to sign in" variant="ghost" onPress={() => router.replace('/login')} />
        </Card>
        <Txt v="bodySm" color={c.faint} style={{ textAlign: 'center' }}>Demo only: no email is actually sent until you connect a backend.</Txt>
      </View>
    </SafeAreaView>
  );
}
