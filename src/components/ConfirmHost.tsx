import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Btn, Sheet, Txt } from './ui';
import { ConfirmConfig, registerConfirmHost } from './dialog';
import { useTheme } from '../theme';

/** Render once near the root. Shows the confirm bottom sheet requested by confirmAction(). */
export default function ConfirmHost() {
  const { c } = useTheme();
  const [cfg, setCfg] = useState<ConfirmConfig | null>(null);
  useEffect(() => {
    registerConfirmHost(setCfg);
    return () => registerConfirmHost(null);
  }, []);
  const close = () => setCfg(null);
  return (
    <Sheet visible={!!cfg} onClose={close} title={cfg?.title}>
      {cfg?.message ? <Txt v="body" color={c.muted} style={{ marginBottom: 16 }}>{cfg.message}</Txt> : <View style={{ height: 4 }} />}
      <View style={{ gap: 10 }}>
        <Btn label={cfg?.confirmLabel ?? 'OK'} variant={cfg?.destructive ? 'danger' : 'primary'} onPress={() => { const run = cfg?.onConfirm; close(); run?.(); }} />
        <Btn label="Cancel" variant="secondary" onPress={close} />
      </View>
    </Sheet>
  );
}
