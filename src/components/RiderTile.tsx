import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Rider } from '../types';

const { width: screenWidth } = Dimensions.get('window');
const tileSize = (screenWidth - 40) / 3; // 3 columns with 10px gap and 20px padding

interface RiderTileProps {
  rider: Rider;
  isSelected: boolean;
  onTap: () => void;
  onLongPress: () => void;
}

const RiderTile: React.FC<RiderTileProps> = ({
  rider,
  isSelected,
  onTap,
  onLongPress,
}) => {
  const getPositionColor = (position: number) => {
    if (position === 1) return '#fbbf24'; // Gold
    if (position === 2) return '#9ca3af'; // Silver
    if (position === 3) return '#b45309'; // Bronze
    return '#6b7280'; // Default
  };

  const getLapColor = (laps: number) => {
    if (laps === 0) return '#9ca3af';
    if (laps < 5) return '#10b981'; // Green
    if (laps < 10) return '#f59e0b'; // Yellow
    if (laps < 15) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <TouchableOpacity
      style={[
        styles.tile,
        isSelected && styles.selectedTile,
        { width: tileSize, height: tileSize },
      ]}
      onPress={onTap}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      {/* Rider Number */}
      <View style={styles.numberContainer}>
        <Text style={styles.riderNumber}>#{rider.number}</Text>
        <View style={[styles.positionBadge, { backgroundColor: getPositionColor(rider.position) }]}>
          <Text style={styles.positionText}>{rider.position}</Text>
        </View>
      </View>

      {/* Rider Name */}
      <Text style={styles.riderName} numberOfLines={1}>
        {rider.name}
      </Text>

      {/* Lap Count */}
      <View style={styles.lapContainer}>
        <Text style={[styles.lapCount, { color: getLapColor(rider.laps) }]}>
          {rider.laps}
        </Text>
        <Text style={styles.lapLabel}>LAPS</Text>
      </View>

      {/* Last Crossing Time */}
      {rider.laps > 0 && (
        <Text style={styles.lastCrossing}>
          {new Date(rider.lastCrossingTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </Text>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <View style={styles.selectionIndicator}>
          <View style={styles.selectionDot} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTile: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    transform: [{ scale: 1.05 }],
  },
  numberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  riderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  positionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  riderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginVertical: 4,
  },
  lapContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  lapCount: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  lapLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lastCrossing: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb',
  },
});

export default RiderTile;


