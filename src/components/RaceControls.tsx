import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface RaceControlsProps {
  status: 'pre-race' | 'live' | 'paused' | 'finished';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onReset: () => void;
}

const RaceControls: React.FC<RaceControlsProps> = ({
  status,
  onStart,
  onPause,
  onResume,
  onFinish,
  onReset,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pre-race':
        return '#6b7280';
      case 'live':
        return '#10b981';
      case 'paused':
        return '#f59e0b';
      case 'finished':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pre-race':
        return 'Ready to Start';
      case 'live':
        return 'Race Live';
      case 'paused':
        return 'Race Paused';
      case 'finished':
        return 'Race Finished';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Display */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {status === 'pre-race' && (
          <TouchableOpacity style={[styles.controlButton, styles.startButton]} onPress={onStart}>
            <Icon name="flag-checkered" size={24} color="#ffffff" />
            <Text style={styles.startButtonText}>Start Race</Text>
          </TouchableOpacity>
        )}

        {status === 'live' && (
          <View style={styles.liveControls}>
            <TouchableOpacity style={[styles.controlButton, styles.pauseButton]} onPress={onPause}>
              <Icon name="pause" size={24} color="#ffffff" />
              <Text style={styles.pauseButtonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.finishButton]} onPress={onFinish}>
              <Icon name="flag-checkered" size={24} color="#ffffff" />
              <Text style={styles.finishButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'paused' && (
          <View style={styles.pausedControls}>
            <TouchableOpacity style={[styles.controlButton, styles.resumeButton]} onPress={onResume}>
              <Icon name="play" size={24} color="#ffffff" />
              <Text style={styles.resumeButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.controlButton, styles.finishButton]} onPress={onFinish}>
              <Icon name="flag-checkered" size={24} color="#ffffff" />
              <Text style={styles.finishButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'finished' && (
          <TouchableOpacity style={[styles.controlButton, styles.resetButton]} onPress={onReset}>
            <Icon name="refresh" size={24} color="#ffffff" />
            <Text style={styles.resetButtonText}>New Race</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  controlsContainer: {
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  liveControls: {
    flexDirection: 'row',
    gap: 15,
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
  },
  pauseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  finishButton: {
    backgroundColor: '#ef4444',
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  pausedControls: {
    flexDirection: 'row',
    gap: 15,
  },
  resumeButton: {
    backgroundColor: '#10b981',
  },
  resumeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: '#8b5cf6',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RaceControls;


