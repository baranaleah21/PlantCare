import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PlantCareProvider } from '../context/PlantCareContext';

export default function RootLayout() {
  return (
    <PlantCareProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </PlantCareProvider>
  );
}
