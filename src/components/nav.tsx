import React, { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

/** Maps the screen-name based calls used by the screens onto expo-router paths. */
export function makeNav(router: ReturnType<typeof useRouter>) {
  const path = (name: string, p: any = {}): string => {
    switch (name) {
      case 'Tabs':
        if (p.screen === 'History') return p.params?.plantId ? `/history?plantId=${p.params.plantId}` : '/history';
        if (p.screen === 'Profile') return '/settings';
        if (p.screen === 'Calendar') return '/calendar';
        if (p.screen === 'Plants') return '/plants';
        return '/home';
      case 'Home': return '/home';
      case 'Plants': return '/plants';
      case 'Calendar': return '/calendar';
      case 'History': return '/history';
      case 'Profile': return '/settings';
      case 'Reminders': return '/reminders';
      case 'PlantDetail': return `/plant/${p.id}`;
      case 'AddPlant': return '/add-plant';
      case 'CareSession': return `/care-session?plantId=${p.plantId}&type=${p.type ?? 'water'}`;
      default: return '/home';
    }
  };
  return {
    navigate: (name: string, p?: any) => router.push(path(name, p) as any),
    replace: (name: string, p?: any) => router.replace(path(name, p) as any),
    goBack: () => (router.canGoBack() ? router.back() : router.replace('/home')),
    setParams: (p: Record<string, any>) => router.setParams(Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v ?? '']))),
  };
}

/** Wrap a screen written against `{ navigation, route }` props for use as an expo-router route. */
export function withRouter<P extends { navigation: any; route: any }>(Screen: React.ComponentType<P>) {
  return function Routed() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const navigation = useMemo(() => makeNav(router), [router]);
    return <Screen {...({ navigation, route: { params } } as unknown as P)} />;
  };
}
