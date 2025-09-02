import AsyncStorage from '@react-native-async-storage/async-storage';
import { RaceState, AppSettings, ImportExportData } from '../types';

const STORAGE_KEYS = {
  RACE_STATE: 'mxcounter_race_state',
  APP_SETTINGS: 'mxcounter_app_settings',
  RIDERS_LIST: 'mxcounter_riders_list',
  ACTIONS_HISTORY: 'mxcounter_actions_history',
} as const;

export class StorageService {
  // Race State
  static async saveRaceState(raceState: RaceState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RACE_STATE, JSON.stringify(raceState));
    } catch (error) {
      console.error('Error saving race state:', error);
    }
  }

  static async getRaceState(): Promise<RaceState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RACE_STATE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting race state:', error);
      return null;
    }
  }

  // App Settings
  static async saveAppSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving app settings:', error);
    }
  }

  static async getAppSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error getting app settings:', error);
    }
    
    // Return default settings
    return {
      maxRiders: 30,
      autoSort: true,
      soundEnabled: true,
      vibrationEnabled: true,
      theme: 'auto',
      keepAwake: true,
    };
  }

  // Riders List
  static async saveRidersList(riders: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RIDERS_LIST, JSON.stringify(riders));
    } catch (error) {
      console.error('Error saving riders list:', error);
    }
  }

  static async getRidersList(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RIDERS_LIST);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting riders list:', error);
      return [];
    }
  }

  // Actions History
  static async saveActionsHistory(actions: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIONS_HISTORY, JSON.stringify(actions));
    } catch (error) {
      console.error('Error saving actions history:', error);
    }
  }

  static async getActionsHistory(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIONS_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting actions history:', error);
      return [];
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  // Export data
  static async exportData(): Promise<ImportExportData | null> {
    try {
      const raceState = await this.getRaceState();
      if (!raceState) return null;

      return {
        riders: raceState.riders.map(rider => ({
          number: rider.number,
          name: rider.name,
        })),
        raceName: raceState.name,
        maxLaps: raceState.maxLaps,
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }
}

