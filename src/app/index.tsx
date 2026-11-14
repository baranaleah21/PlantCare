import React from 'react';
import { Redirect } from 'expo-router';
import { usePlantCare } from '../context/PlantCareContext';

export default function Index() {
  const { state } = usePlantCare();
  return <Redirect href={state.authed ? '/home' : '/login'} />;
}
