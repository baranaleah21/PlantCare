import React, { createContext, useContext, useState } from 'react';

export type Plant = {
  id: string;
  name: string;
  species: string;
  nextCare: string;
  frequency: string;
  done?: boolean;
};

type PlantCareContextType = {
  plants: Plant[];
  addPlant: (plant: Omit<Plant, 'id'>) => void;
  toggleDone: (id: string) => void;
  removePlant: (id: string) => void;
  signedInEmail: string;
  signIn: (email: string) => void;
  signOut: () => void;
};

const PlantCareContext = createContext<PlantCareContextType | null>(null);

export function PlantCareProvider({ children }: { children: React.ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>([
    { id: 'demo-1', name: 'Monstera', species: 'Monstera deliciosa', nextCare: 'Water today', frequency: 'Every 7 days' },
    { id: 'demo-2', name: 'Snake Plant', species: 'Dracaena trifasciata', nextCare: 'Check sunlight', frequency: 'Every 14 days' },
  ]);
  const [signedInEmail, setSignedInEmail] = useState('');

  const addPlant = (plant: Omit<Plant, 'id'>) => {
    setPlants(current => [{ ...plant, id: `${Date.now()}-${Math.random()}` }, ...current]);
  };
  const toggleDone = (id: string) => {
    setPlants(current => current.map(p => p.id === id ? { ...p, done: !p.done } : p));
  };
  const removePlant = (id: string) => setPlants(current => current.filter(p => p.id !== id));
  const signIn = (email: string) => setSignedInEmail(email);
  const signOut = () => setSignedInEmail('');

  return (
    <PlantCareContext.Provider value={{ plants, addPlant, toggleDone, removePlant, signedInEmail, signIn, signOut }}>
      {children}
    </PlantCareContext.Provider>
  );
}

export function usePlantCare() {
  const context = useContext(PlantCareContext);
  if (!context) throw new Error('usePlantCare must be used inside PlantCareProvider');
  return context;
}
