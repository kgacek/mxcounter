import { useState, useEffect, useCallback } from 'react';
import { RaceState, Rider, LapAction, AppSettings } from '../types';
import { StorageService } from '../utils/storage.web';
import { RaceLogic } from '../utils/raceLogic';

const initialState: RaceState = {
  id: 'race_1',
  name: 'Motocross Race',
  status: 'pre-race',
  startTime: null,
  endTime: null,
  riders: [],
  actions: [],
  maxLaps: 20,
  currentLap: 0,
};

export const useRaceState = () => {
  const [raceState, setRaceState] = useState<RaceState>(initialState);
  const [settings, setSettings] = useState<AppSettings>({
    maxRiders: 30,
    autoSort: false, // Changed to false since we're doing manual sorting
    soundEnabled: false,
    vibrationEnabled: false, // Disabled for web
    theme: 'light',
    keepAwake: false, // Not applicable for web
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
    const newState = RaceLogic.incrementLap(raceState.riders, riderId);
    if (newState) {
      // Web-compatible feedback (could add sound or visual feedback)
      if (settings.soundEnabled) {
        // Play a beep sound or show visual feedback
        console.log('Lap incremented!');
      }
      // Don't automatically reorder riders - keep them in current order
      const updatedState = {
        ...raceState,
        riders: newState.riders.map((rider, index) => ({
          ...rider,
          position: index + 1, // Keep simple sequential positioning
        })),
        actions: [...raceState.actions, newState.action],
      };
      saveState(updatedState);
    }
  }, [raceState, settings.soundEnabled, saveState]);

  const decrementLap = useCallback((riderId: string) => {
    const newState = RaceLogic.decrementLap(raceState.riders, riderId);
    if (newState) {
      if (settings.soundEnabled) {
        console.log('Lap decremented!');
      }
      const updatedState = {
        ...raceState,
        riders: newState.riders.map((rider, index) => ({
          ...rider,
          position: index + 1, // Keep simple sequential positioning
        })),
        actions: [...raceState.actions, newState.action],
      };
      saveState(updatedState);
    }
  }, [raceState, settings.soundEnabled, saveState]);

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
            lastCrossingTime: lastAction.previousLaps,
          };
        }
        return rider;
      }),
    };

    // Reorder riders based on new lap counts
    const updatedState = {
      ...newState,
      riders: RaceLogic.updatePositions(newState.riders),
    };
    saveState(updatedState);
  }, [raceState, saveState]);

  const startRace = useCallback(() => {
    const newState = {
      ...raceState,
      status: 'live',
      startTime: Date.now(),
      currentLap: 1,
    };
    saveState(newState);
  }, [raceState, saveState]);

  const pauseRace = useCallback(() => {
    const newState = {
      ...raceState,
      status: 'paused',
    };
    saveState(newState);
  }, [raceState, saveState]);

  const resumeRace = useCallback(() => {
    const newState = {
      ...raceState,
      status: 'live',
    };
    saveState(newState);
  }, [raceState, saveState]);

  const finishRace = useCallback(() => {
    const newState = {
      ...raceState,
      status: 'finished',
      endTime: Date.now(),
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
        lastCrossingTime: Date.now(),
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
      lastCrossingTime: Date.now(),
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

  const updateRaceSettings = useCallback((updates: Partial<Pick<RaceState, 'name' | 'maxLaps'>>) => {
    const newState = { ...raceState, ...updates };
    saveState(newState);
  }, [raceState, saveState]);

  const generateSampleRiders = useCallback(() => {
    const sampleRiders = RaceLogic.generateSampleRiders(20);
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
    saveState,
  };
};
