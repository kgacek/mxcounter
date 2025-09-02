import { useState, useEffect, useCallback } from 'react';
import { RaceState, Rider, LapAction, AppSettings } from '../types';
import { StorageService } from '../utils/storage';
import { RaceLogic } from '../utils/raceLogic';
import { Vibration } from 'react-native';

const initialState: RaceState = {
  riders: [],
  actions: [],
  raceStatus: 'idle',
  startTime: null,
  endTime: null,
  raceName: 'Motocross Race',
  maxLaps: 20,
  currentLap: 0,
};

export const useRaceState = () => {
  const [raceState, setRaceState] = useState<RaceState>(initialState);
  const [settings, setSettings] = useState<AppSettings>({
    autoSort: true,
    soundEnabled: false,
    vibrationEnabled: true,
    keepAwake: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [savedState, savedSettings, savedRiders] = await Promise.all([
        StorageService.getRaceState(),
        StorageService.getAppSettings(),
        StorageService.getRidersList(),
      ]);

      if (savedState) {
        setRaceState(savedState);
      }
      if (savedSettings) {
        setSettings(savedSettings);
      }
      if (savedRiders && savedRiders.length > 0) {
        setRaceState(prev => ({ ...prev, riders: savedRiders }));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveState = useCallback(async (newState: RaceState) => {
    try {
      await StorageService.saveRaceState(newState);
      setRaceState(newState);
    } catch (error) {
      console.error('Error saving race state:', error);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      await StorageService.saveAppSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, []);

  // Race actions
  const incrementLap = useCallback((riderId: string) => {
    const newState = RaceLogic.incrementLap(raceState, riderId);
    if (newState) {
      if (settings.vibrationEnabled) {
        Vibration.vibrate(100);
      }
      saveState(newState);
    }
  }, [raceState, settings.vibrationEnabled, saveState]);

  const decrementLap = useCallback((riderId: string) => {
    const newState = RaceLogic.decrementLap(raceState, riderId);
    if (newState) {
      if (settings.vibrationEnabled) {
        Vibration.vibrate(50);
      }
      saveState(newState);
    }
  }, [raceState, settings.vibrationEnabled, saveState]);

  const undoLastAction = useCallback(() => {
    if (raceState.actions.length === 0) return;
    
    const newActions = [...raceState.actions];
    const lastAction = newActions.pop()!;
    
    const newState = {
      ...raceState,
      actions: newActions,
      riders: raceState.riders.map(rider => {
        if (rider.id === lastAction.riderId) {
          return {
            ...rider,
            laps: Math.max(0, rider.laps - 1),
            lastCrossing: lastAction.previousLapTime,
          };
        }
        return rider;
      }),
    };

    // Reorder riders based on new lap counts
    const updatedState = RaceLogic.updatePositions(newState);
    saveState(updatedState);
  }, [raceState, saveState]);

  const startRace = useCallback(() => {
    const newState = {
      ...raceState,
      raceStatus: 'active',
      startTime: new Date().toISOString(),
      currentLap: 1,
    };
    saveState(newState);
  }, [raceState, saveState]);

  const pauseRace = useCallback(() => {
    const newState = {
      ...raceState,
      raceStatus: 'paused',
    };
    saveState(newState);
  }, [raceState, saveState]);

  const resumeRace = useCallback(() => {
    const newState = {
      ...raceState,
      raceStatus: 'active',
    };
    saveState(newState);
  }, [raceState, saveState]);

  const finishRace = useCallback(() => {
    const newState = {
      ...raceState,
      raceStatus: 'finished',
      endTime: new Date().toISOString(),
    };
    saveState(newState);
  }, [raceState, saveState]);

  const resetRace = useCallback(() => {
    const newState = {
      ...initialState,
      riders: raceState.riders.map(rider => ({
        ...rider,
        laps: 0,
        position: 0,
        lastCrossing: null,
      })),
    };
    saveState(newState);
  }, [raceState.riders, saveState]);

  // Rider management
  const addRider = useCallback((rider: Omit<Rider, 'id'>) => {
    const newRider: Rider = {
      ...rider,
      id: Date.now().toString(),
      laps: 0,
      position: 0,
      lastCrossing: null,
      isActive: true,
    };
    
    const newState = {
      ...raceState,
      riders: [...raceState.riders, newRider],
    };
    saveState(newState);
  }, [raceState, saveState]);

  const removeRider = useCallback((riderId: string) => {
    const newState = {
      ...raceState,
      riders: raceState.riders.filter(rider => rider.id !== riderId),
    };
    saveState(newState);
  }, [raceState, saveState]);

  const toggleRiderActive = useCallback((riderId: string) => {
    const newState = {
      ...raceState,
      riders: raceState.riders.map(rider =>
        rider.id === riderId ? { ...rider, isActive: !rider.isActive } : rider
      ),
    };
    saveState(newState);
  }, [raceState, saveState]);

  const updateRaceSettings = useCallback((updates: Partial<Pick<RaceState, 'raceName' | 'maxLaps'>>) => {
    const newState = { ...raceState, ...updates };
    saveState(newState);
  }, [raceState, saveState]);

  const generateSampleRiders = useCallback(() => {
    const sampleRiders = RaceLogic.generateSampleRiders();
    const newState = {
      ...raceState,
      riders: sampleRiders,
    };
    saveState(newState);
  }, [raceState, saveState]);

  const clearAllRiders = useCallback(() => {
    const newState = {
      ...raceState,
      riders: [],
    };
    saveState(newState);
  }, [raceState, saveState]);

  const clearAllData = useCallback(async () => {
    try {
      await StorageService.clearAllData();
      setRaceState(initialState);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }, []);

  return {
    raceState,
    settings,
    isLoading,
    incrementLap,
    decrementLap,
    undoLastAction,
    startRace,
    pauseRace,
    resumeRace,
    finishRace,
    resetRace,
    addRider,
    removeRider,
    toggleRiderActive,
    updateRaceSettings,
    generateSampleRiders,
    clearAllRiders,
    clearAllData,
    saveSettings,
  };
};

