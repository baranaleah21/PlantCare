import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, useTheme } from '../../theme';
import { Icon } from '../../components/ui';

const TABS: { name: string; title: string; icon: [string, string] }[] = [
  { name: 'home', title: 'Home', icon: ['home-variant-outline', 'home-variant'] },
  { name: 'plants', title: 'Plants', icon: ['sprout-outline', 'sprout'] },
  { name: 'calendar', title: 'Calendar', icon: ['calendar-month-outline', 'calendar-month'] },
  { name: 'history', title: 'History', icon: ['history', 'history'] },
  { name: 'settings', title: 'Profile', icon: ['account-outline', 'account'] },
];

export default function TabsLayout() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: c.bg },
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.faint,
        tabBarLabelStyle: { fontFamily: fonts.semi, fontSize: 11 },
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.divider, height: Platform.OS === 'web' ? 84 : 62 + insets.bottom, paddingTop: 6, paddingBottom: Platform.OS === 'web' ? 24 : Math.max(insets.bottom, 8) },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title, tabBarIcon: ({ focused, color }) => <Icon name={t.icon[focused ? 1 : 0]} size={25} color={color} /> }} />
      ))}
    </Tabs>
  );
}
