import { Alert, Platform } from 'react-native';

export interface ConfirmConfig { title: string; message?: string; confirmLabel: string; destructive: boolean; onConfirm: () => void }

// The in-app confirm box (ConfirmHost) registers itself here so every screen can use it.
let host: ((c: ConfirmConfig) => void) | null = null;
export const registerConfirmHost = (fn: ((c: ConfirmConfig) => void) | null) => { host = fn; };

/** Confirm dialog drawn inside the app (works on phone and web, even where browser pop-ups are blocked). */
export function confirmAction(title: string, message: string | undefined, confirmLabel: string, onConfirm: () => void, destructive = true) {
  if (host) { host({ title, message, confirmLabel, destructive, onConfirm }); return; }
  if (Platform.OS === 'web') {
    const g = globalThis as any;
    if (typeof g.confirm !== 'function' || g.confirm(message ? `${title}\n\n${message}` : title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm }]);
}

/** Simple message box that works on phones and on web. */
export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    const g = globalThis as any;
    if (typeof g.alert === 'function') g.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
