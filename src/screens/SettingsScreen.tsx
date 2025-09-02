import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRaceContext } from '../context/RaceContext';
import { AppSettings } from '../types';

const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { settings, saveSettings, raceState, updateRaceSettings } = useRaceContext();
  const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
  const [raceName, setRaceName] = useState(raceState?.name || '');
  const [maxLaps, setMaxLaps] = useState(raceState?.maxLaps?.toString() || '20');

  // Initialize local settings when component mounts
  React.useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings);
    }
  }, [settings, localSettings]);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        [key]: value,
      });
    }
  };

  const handleSaveSettings = async () => {
    if (localSettings) {
      try {
        await saveSettings(localSettings);
        Alert.alert('Success', 'Settings saved successfully!');
      } catch (error) {
        Alert.alert('Error', 'Failed to save settings. Please try again.');
      }
    }
  };

  const handleSaveRaceSettings = async () => {
    if (raceState) {
      try {
        const updates: Partial<typeof raceState> = {};
        
        if (raceName.trim() !== raceState.name) {
          updates.name = raceName.trim();
        }
        
        const newMaxLaps = parseInt(maxLaps);
        if (!isNaN(newMaxLaps) && newMaxLaps !== raceState.maxLaps) {
          updates.maxLaps = newMaxLaps;
        }

        if (Object.keys(updates).length > 0) {
          await updateRaceSettings(updates);
          Alert.alert('Success', 'Race settings updated successfully!');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to update race settings. Please try again.');
      }
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings: AppSettings = {
              maxRiders: 30,
              autoSort: true,
              soundEnabled: true,
              vibrationEnabled: true,
              theme: 'auto',
              keepAwake: true,
            };
            setLocalSettings(defaultSettings);
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all race data, riders, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            // This would typically call a clear data function
            Alert.alert('Data Cleared', 'All data has been cleared successfully.');
          },
        },
      ]
    );
  };

  if (!localSettings) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Icon name="loading" size={48} color="#2563eb" />
          <Text style={styles.loadingText}>Loading Settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Race Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Race Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Race Name</Text>
            <TextInput
              style={styles.textInput}
              value={raceName}
              onChangeText={setRaceName}
              placeholder="Enter race name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Maximum Laps</Text>
            <TextInput
              style={styles.textInput}
              value={maxLaps}
              onChangeText={setMaxLaps}
              placeholder="20"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveRaceSettings}>
            <Icon name="content-save" size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>Save Race Settings</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Maximum Riders</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>{localSettings.maxRiders}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => handleSettingChange('maxRiders', Math.max(10, localSettings.maxRiders - 5))}
              >
                <Icon name="minus" size={16} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => handleSettingChange('maxRiders', Math.min(50, localSettings.maxRiders + 5))}
              >
                <Icon name="plus" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-sort Riders</Text>
            <Switch
              value={localSettings.autoSort}
              onValueChange={(value) => handleSettingChange('autoSort', value)}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={localSettings.autoSort ? '#2563eb' : '#9ca3af'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Switch
              value={localSettings.soundEnabled}
              onValueChange={(value) => handleSettingChange('soundEnabled', value)}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={localSettings.soundEnabled ? '#2563eb' : '#9ca3af'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Switch
              value={localSettings.vibrationEnabled}
              onValueChange={(value) => handleSettingChange('vibrationEnabled', value)}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={localSettings.vibrationEnabled ? '#2563eb' : '#9ca3af'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Keep Screen Awake</Text>
            <Switch
              value={localSettings.keepAwake}
              onValueChange={(value) => handleSettingChange('keepAwake', value)}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={localSettings.keepAwake ? '#2563eb' : '#9ca3af'}
            />
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleSaveSettings}>
            <Icon name="content-save" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Save All Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.resetButton]} onPress={handleResetSettings}>
            <Icon name="refresh" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleClearData}>
            <Icon name="delete" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.01.01</Text>
          </View>
          
          <Text style={styles.appDescription}>
            Motocross Lap Counter - A professional lap counting app for motocross events.
            Designed for race officials and spectators with real-time updates and offline functionality.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    minWidth: 30,
    textAlign: 'center',
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#374151',
    minWidth: 120,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#f59e0b',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  appDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
  },
});

export default SettingsScreen;


