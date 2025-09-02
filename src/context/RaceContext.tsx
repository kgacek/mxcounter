import React, { createContext, useContext, ReactNode } from 'react';
import { useRaceState } from '../hooks/useRaceState';

interface RaceContextType {
  raceState: any;
  settings: any;
  isLoading: boolean;
  incrementLap: (riderId: string) => Promise<void>;
  decrementLap: (riderId: string) => Promise<void>;
  undoLastAction: () => Promise<void>;
  startRace: () => Promise<void>;
  pauseRace: () => Promise<void>;
  resumeRace: () => Promise<void>;
  finishRace: () => Promise<void>;
  resetRace: () => Promise<void>;
  updateRaceSettings: (updates: any) => Promise<void>;
  addRider: (rider: any) => Promise<void>;
  removeRider: (riderId: string) => Promise<void>;
  toggleRiderActive: (riderId: string) => Promise<void>;
  getRaceStats: () => any;
  getPodiumRiders: () => any[];
  saveSettings: (settings: any) => Promise<void>;
}

const RaceContext = createContext<RaceContextType | undefined>(undefined);

export const useRaceContext = () => {
  const context = useContext(RaceContext);
  if (context === undefined) {
    throw new Error('useRaceContext must be used within a RaceProvider');
  }
  return context;
};

interface RaceProviderProps {
  children: ReactNode;
}

export const RaceProvider: React.FC<RaceProviderProps> = ({ children }) => {
  const raceState = useRaceState();

  return (
    <RaceContext.Provider value={raceState}>
      {children}
    </RaceContext.Provider>
  );
};


