import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRaceContext } from '../context/RaceContext';
import { Rider } from '../types';

const RaceSetupScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { raceState, updateRaceSettings, addRider, removeRider, toggleRiderActive } = useRaceContext();
  
  const [raceName, setRaceName] = useState(raceState?.name || '');
  const [maxLaps, setMaxLaps] = useState(raceState?.maxLaps?.toString() || '20');
  const [showAddRider, setShowAddRider] = useState(false);
  const [newRiderNumber, setNewRiderNumber] = useState('');
  const [newRiderName, setNewRiderName] = useState('');

  const handleSaveRaceSettings = async () => {
    if (!raceState) return;

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
  };

  const handleAddRider = async () => {
    if (!newRiderNumber.trim() || !newRiderName.trim()) {
      Alert.alert('Error', 'Please enter both rider number and name.');
      return;
    }

    const number = newRiderNumber.trim().padStart(3, '0');
    
    // Check if rider number already exists
    const existingRider = raceState?.riders.find(r => r.number === number);
    if (existingRider) {
      Alert.alert('Error', `Rider #${number} already exists.`);
      return;
    }

    try {
      await addRider({
        number,
        name: newRiderName.trim(),
      });
      
      setNewRiderNumber('');
      setNewRiderName('');
      setShowAddRider(false);
      Alert.alert('Success', `Rider #${number} added successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add rider. Please try again.');
    }
  };

  const handleRemoveRider = (rider: Rider) => {
    Alert.alert(
      'Remove Rider',
      `Are you sure you want to remove rider #${rider.number} (${rider.name})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeRider(rider.id);
              Alert.alert('Success', 'Rider removed successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove rider. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleToggleRiderActive = async (rider: Rider) => {
    try {
      await toggleRiderActive(rider.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to update rider status. Please try again.');
    }
  };

  const generateSampleRiders = async () => {
    Alert.alert(
      'Generate Sample Riders',
      'This will add 20 sample riders to the race. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            try {
              for (let i = 1; i <= 20; i++) {
                const number = i.toString().padStart(3, '0');
                const existingRider = raceState?.riders.find(r => r.number === number);
                if (!existingRider) {
                  await addRider({
                    number,
                    name: `Sample Rider ${number}`,
                  });
                }
              }
              Alert.alert('Success', '20 sample riders generated successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to generate sample riders. Please try again.');
            }
          },
        },
      ]
    );
  };

  const clearAllRiders = () => {
    Alert.alert(
      'Clear All Riders',
      'This will remove all riders from the race. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove all riders one by one
              const ridersToRemove = [...(raceState?.riders || [])];
              for (const rider of ridersToRemove) {
                await removeRider(rider.id);
              }
              Alert.alert('Success', 'All riders cleared successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear riders. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!raceState) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>No race data available</Text>
        </View>
      </View>
    );
  }

  const activeRiders = raceState.riders.filter(r => r.isActive);
  const inactiveRiders = raceState.riders.filter(r => !r.isActive);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Race Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Race Configuration</Text>
          
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

        {/* Rider Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rider Management</Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => setShowAddRider(true)}>
                <Icon name="plus" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Add Rider</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={generateSampleRiders}>
                <Icon name="account-multiple-plus" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Sample</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.riderStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeRiders.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{inactiveRiders.length}</Text>
              <Text style={styles.statLabel}>Inactive</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{raceState.riders.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {raceState.riders.length > 0 && (
            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={clearAllRiders}>
              <Icon name="delete-sweep" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Clear All Riders</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active Riders List */}
        {activeRiders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Riders ({activeRiders.length})</Text>
            {activeRiders.map((rider) => (
              <View key={rider.id} style={styles.riderItem}>
                <View style={styles.riderInfo}>
                  <Text style={styles.riderNumber}>#{rider.number}</Text>
                  <Text style={styles.riderName}>{rider.name}</Text>
                </View>
                <View style={styles.riderActions}>
                  <TouchableOpacity
                    style={[styles.riderActionButton, styles.deactivateButton]}
                    onPress={() => handleToggleRiderActive(rider)}
                  >
                    <Icon name="account-off" size={16} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.riderActionButton, styles.removeButton]}
                    onPress={() => handleRemoveRider(rider)}
                  >
                    <Icon name="delete" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Inactive Riders List */}
        {inactiveRiders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inactive Riders ({inactiveRiders.length})</Text>
            {inactiveRiders.map((rider) => (
              <View key={rider.id} style={styles.riderItem}>
                <View style={styles.riderInfo}>
                  <Text style={styles.riderNumber}>#{rider.number}</Text>
                  <Text style={styles.riderName}>{rider.name}</Text>
                </View>
                <View style={styles.riderActions}>
                  <TouchableOpacity
                    style={[styles.riderActionButton, styles.activateButton]}
                    onPress={() => handleToggleRiderActive(rider)}
                  >
                    <Icon name="account-check" size={16} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.riderActionButton, styles.removeButton]}
                    onPress={() => handleRemoveRider(rider)}
                  >
                    <Icon name="delete" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* No Riders Message */}
        {raceState.riders.length === 0 && (
          <View style={styles.section}>
            <View style={styles.noRidersContainer}>
              <Icon name="account-group-off" size={48} color="#9ca3af" />
              <Text style={styles.noRidersText}>No riders added yet</Text>
              <Text style={styles.noRidersSubtext}>
                Add riders manually or generate sample riders to get started
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Rider Modal */}
      <Modal
        visible={showAddRider}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddRider(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Rider</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rider Number</Text>
              <TextInput
                style={styles.modalInput}
                value={newRiderNumber}
                onChangeText={setNewRiderNumber}
                placeholder="001"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rider Name</Text>
              <TextInput
                style={styles.modalInput}
                value={newRiderName}
                onChangeText={setNewRiderName}
                placeholder="Enter rider name"
                placeholderTextColor="#9ca3af"
                maxLength={30}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddRider(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddRider}
              >
                <Text style={styles.confirmButtonText}>Add Rider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 10,
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
  riderStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#10b981',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  riderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  riderInfo: {
    flex: 1,
  },
  riderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  riderName: {
    fontSize: 14,
    color: '#374151',
  },
  riderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  riderActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activateButton: {
    backgroundColor: '#10b981',
  },
  deactivateButton: {
    backgroundColor: '#f59e0b',
  },
  removeButton: {
    backgroundColor: '#ef4444',
  },
  noRidersContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noRidersText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    fontWeight: '600',
  },
  noRidersSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 40,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#2563eb',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default RaceSetupScreen;


