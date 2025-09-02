import { RaceState, AppSettings, Rider, LapAction } from '../types';

// Web-compatible storage using localStorage
export class StorageService {
  private static readonly RACE_STATE_KEY = 'mxcounter_race_state';
  private static readonly APP_SETTINGS_KEY = 'mxcounter_app_settings';
  private static readonly RIDERS_LIST_KEY = 'mxcounter_riders_list';
  private static readonly ACTIONS_HISTORY_KEY = 'mxcounter_actions_history';

  // Race State
  static async saveRaceState(state: RaceState): Promise<void> {
    try {
      localStorage.setItem(this.RACE_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving race state:', error);
      throw error;
    }
  }

  static async getRaceState(): Promise<RaceState | null> {
    try {
      const data = localStorage.getItem(this.RACE_STATE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting race state:', error);
      return null;
    }
  }

  // App Settings
  static async saveAppSettings(settings: AppSettings): Promise<void> {
    try {
      localStorage.setItem(this.APP_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving app settings:', error);
      throw error;
    }
  }

  static async getAppSettings(): Promise<AppSettings | null> {
    try {
      const data = localStorage.getItem(this.APP_SETTINGS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting app settings:', error);
      return null;
    }
  }

  // Riders List
  static async saveRidersList(riders: Rider[]): Promise<void> {
    try {
      localStorage.setItem(this.RIDERS_LIST_KEY, JSON.stringify(riders));
    } catch (error) {
      console.error('Error saving riders list:', error);
      throw error;
    }
  }

  static async getRidersList(): Promise<Rider[] | null> {
    try {
      const data = localStorage.getItem(this.RIDERS_LIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting riders list:', error);
      return [];
    }
  }

  // Actions History
  static async saveActionsHistory(actions: LapAction[]): Promise<void> {
    try {
      localStorage.setItem(this.ACTIONS_HISTORY_KEY, JSON.stringify(actions));
    } catch (error) {
      console.error('Error saving actions history:', error);
      throw error;
    }
  }

  static async getActionsHistory(): Promise<LapAction[] | null> {
    try {
      const data = localStorage.getItem(this.ACTIONS_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting actions history:', error);
      return [];
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.RACE_STATE_KEY);
      localStorage.removeItem(this.APP_SETTINGS_KEY);
      localStorage.removeItem(this.RIDERS_LIST_KEY);
      localStorage.removeItem(this.ACTIONS_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // Export data
  static async exportData(): Promise<any> {
    try {
      const raceState = await this.getRaceState();
      const appSettings = await this.getAppSettings();
      const ridersList = await this.getRidersList();
      const actionsHistory = await this.getActionsHistory();

      return {
        raceState,
        appSettings,
        ridersList,
        actionsHistory,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
}

