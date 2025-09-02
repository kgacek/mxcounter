import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRaceContext } from '../context/RaceContext';
import RiderTile from '../components/RiderTile';
import RaceControls from '../components/RaceControls';
import RaceStats from '../components/RaceStats';
import { Rider } from '../types';

const { width: screenWidth } = Dimensions.get('window');

const OperatorScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    raceState,
    isLoading,
    incrementLap,
    undoLastAction,
    startRace,
    pauseRace,
    resumeRace,
    finishRace,
    resetRace,
    getRaceStats,
  } = useRaceContext();

  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);

  // Handle rider tile tap
  const handleRiderTap = useCallback(async (rider: Rider) => {
    if (!raceState || raceState.status !== 'live') {
      Alert.alert('Race Not Started', 'Please start the race before counting laps.');
      return;
    }

    try {
      // Haptic feedback
      Vibration.vibrate(50);
      
      await incrementLap(rider.id);
      setSelectedRider(rider);
      
      // Auto-deselect after a short delay
      setTimeout(() => setSelectedRider(null), 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to increment lap. Please try again.');
    }
  }, [raceState, incrementLap]);

  // Handle rider long press (undo)
  const handleRiderLongPress = useCallback((rider: Rider) => {
    if (rider.laps > 0) {
      setSelectedRider(rider);
      setShowUndoConfirm(true);
    }
  }, []);

  // Confirm undo action
  const confirmUndo = useCallback(async () => {
    if (selectedRider) {
      try {
        await undoLastAction();
        setShowUndoConfirm(false);
        setSelectedRider(null);
      } catch (error) {
        Alert.alert('Error', 'Failed to undo action. Please try again.');
      }
    }
  }, [selectedRider, undoLastAction]);

  // Navigate to race setup
  const handleRaceSetup = () => {
    navigation.navigate('RaceSetup' as never);
  };

  // Navigate to results
  const handleViewResults = () => {
    navigation.navigate('Results' as never);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Icon name="loading" size={48} color="#2563eb" />
          <Text style={styles.loadingText}>Loading Race Data...</Text>
        </View>
      </View>
    );
  }

  if (!raceState) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load race data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const activeRiders = raceState.riders.filter(r => r.isActive);
  const raceStats = getRaceStats();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{raceState.name}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleRaceSetup}>
            <Icon name="cog" size={24} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleViewResults}>
            <Icon name="trophy" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Race Controls */}
      <RaceControls
        status={raceState.status}
        onStart={startRace}
        onPause={pauseRace}
        onResume={resumeRace}
        onFinish={finishRace}
        onReset={resetRace}
      />

      {/* Race Stats */}
      {raceStats && (
        <RaceStats stats={raceStats} />
      )}

      {/* Rider Grid */}
      <ScrollView 
        style={styles.riderGrid}
        contentContainerStyle={styles.riderGridContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {activeRiders.map((rider) => (
            <RiderTile
              key={rider.id}
              rider={rider}
              isSelected={selectedRider?.id === rider.id}
              onTap={() => handleRiderTap(rider)}
              onLongPress={() => handleRiderLongPress(rider)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Undo Confirmation Modal */}
      {showUndoConfirm && selectedRider && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Undo Last Lap?</Text>
            <Text style={styles.modalText}>
              Remove the last lap for rider #{selectedRider.number}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowUndoConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={confirmUndo}
              >
                <Text style={styles.confirmButtonText}>Undo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
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
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  riderGrid: {
    flex: 1,
  },
  riderGridContent: {
    padding: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 40,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
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
    backgroundColor: '#ef4444',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OperatorScreen;


