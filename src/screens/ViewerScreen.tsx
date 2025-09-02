import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRaceContext } from '../context/RaceContext';
import { Rider } from '../types';

const ViewerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { raceState, isLoading } = useRaceContext();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'position' | 'laps' | 'number'>('position');

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger a re-render by updating state
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 100);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getSortedRiders = () => {
    if (!raceState) return [];

    const activeRiders = raceState.riders.filter(r => r.isActive);
    
    switch (sortBy) {
      case 'position':
        return [...activeRiders].sort((a, b) => a.position - b.position);
      case 'laps':
        return [...activeRiders].sort((a, b) => b.laps - a.laps);
      case 'number':
        return [...activeRiders].sort((a, b) => parseInt(a.number) - parseInt(b.number));
      default:
        return activeRiders;
    }
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return '🏆';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return '#fbbf24';
    if (position === 2) return '#9ca3af';
    if (position === 3) return '#b45309';
    return '#6b7280';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Icon name="loading" size={48} color="#2563eb" />
          <Text style={styles.loadingText}>Loading Race Results...</Text>
        </View>
      </View>
    );
  }

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

  const sortedRiders = getSortedRiders();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Live Results</Text>
        <View style={styles.raceInfo}>
          <Text style={styles.raceName}>{raceState.name}</Text>
          <Text style={styles.raceStatus}>
            {raceState.status === 'live' ? '🟢 LIVE' : 
             raceState.status === 'paused' ? '🟡 PAUSED' : 
             raceState.status === 'finished' ? '🔴 FINISHED' : '⚪ READY'}
          </Text>
        </View>
      </View>

      {/* Sort Controls */}
      <View style={styles.sortControls}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'position' && styles.activeSortButton]}
            onPress={() => setSortBy('position')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'position' && styles.activeSortButtonText]}>
              Position
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'laps' && styles.activeSortButton]}
            onPress={() => setSortBy('laps')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'laps' && styles.activeSortButtonText]}>
              Laps
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'number' && styles.activeSortButton]}
            onPress={() => setSortBy('number')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'number' && styles.activeSortButtonText]}>
              Number
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Table */}
      <ScrollView
        style={styles.resultsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <View style={styles.headerPosition}>
            <Text style={styles.headerText}>Pos</Text>
          </View>
          <View style={styles.headerNumber}>
            <Text style={styles.headerText}>#</Text>
          </View>
          <View style={styles.headerName}>
            <Text style={styles.headerText}>Rider</Text>
          </View>
          <View style={styles.headerLaps}>
            <Text style={styles.headerText}>Laps</Text>
          </View>
          <View style={styles.headerTime}>
            <Text style={styles.headerText}>Last</Text>
          </View>
        </View>

        {/* Table Rows */}
        {sortedRiders.map((rider, index) => (
          <View key={rider.id} style={styles.tableRow}>
            <View style={styles.cellPosition}>
              <Text style={[styles.positionText, { color: getPositionColor(rider.position) }]}>
                {getPositionIcon(rider.position)}
              </Text>
            </View>
            <View style={styles.cellNumber}>
              <Text style={styles.numberText}>#{rider.number}</Text>
            </View>
            <View style={styles.cellName}>
              <Text style={styles.nameText} numberOfLines={1}>
                {rider.name}
              </Text>
            </View>
            <View style={styles.cellLaps}>
              <Text style={styles.lapsText}>{rider.laps}</Text>
            </View>
            <View style={styles.cellTime}>
              <Text style={styles.timeText}>
                {rider.laps > 0 
                  ? new Date(rider.lastCrossingTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : '--:--:--'
                }
              </Text>
            </View>
          </View>
        ))}

        {/* No Results */}
        {sortedRiders.length === 0 && (
          <View style={styles.noResults}>
            <Icon name="flag-off" size={48} color="#9ca3af" />
            <Text style={styles.noResultsText}>No active riders</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Auto-refreshing every 5 seconds • Pull to refresh manually
        </Text>
        <Text style={styles.footerText}>
          {sortedRiders.length} active riders
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  raceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  raceName: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  raceStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sortControls: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeSortButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeSortButtonText: {
    color: '#ffffff',
  },
  resultsContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerPosition: {
    width: 50,
    alignItems: 'center',
  },
  headerNumber: {
    width: 50,
    alignItems: 'center',
  },
  headerName: {
    flex: 1,
    marginHorizontal: 10,
  },
  headerLaps: {
    width: 60,
    alignItems: 'center',
  },
  headerTime: {
    width: 80,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cellPosition: {
    width: 50,
    alignItems: 'center',
  },
  cellNumber: {
    width: 50,
    alignItems: 'center',
  },
  cellName: {
    flex: 1,
    marginHorizontal: 10,
  },
  cellLaps: {
    width: 60,
    alignItems: 'center',
  },
  cellTime: {
    width: 80,
    alignItems: 'center',
  },
  positionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  numberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  nameText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  lapsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
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
});

export default ViewerScreen;


