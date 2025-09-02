export interface Rider {
  id: string;
  number: string;
  name: string;
  laps: number;
  lastCrossingTime: number;
  position: number;
  isActive: boolean;
}

export interface LapAction {
  id: string;
  riderId: string;
  riderNumber: string;
  action: 'increment' | 'decrement';
  timestamp: number;
  previousLaps: number;
  newLaps: number;
}

export interface RaceState {
  id: string;
  name: string;
  status: 'pre-race' | 'live' | 'paused' | 'finished';
  startTime: number | null;
  endTime: number | null;
  riders: Rider[];
  actions: LapAction[];
  maxLaps: number;
  currentLap: number;
}

export interface AppSettings {
  maxRiders: number;
  autoSort: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  keepAwake: boolean;
}

export interface ImportExportData {
  riders: Omit<Rider, 'id' | 'laps' | 'lastCrossingTime' | 'position' | 'isActive'>[];
  raceName: string;
  maxLaps: number;
}

