import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRaceContext } from '../context/RaceContext';
import { Rider } from '../types';

const ResultsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { raceState, getPodiumRiders } = useRaceContext();
  const [showAllResults, setShowAllResults] = useState(false);

  const handleShareResults = async () => {
    if (!raceState) return;

    try {
      const podiumRiders = getPodiumRiders();
      const podiumText = podiumRiders.map((rider, index) => {
        const position = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
        return `${position} #${rider.number} ${rider.name} - ${rider.laps} laps`;
      }).join('\n');

      const shareText = `${raceState.name} - Final Results\n\n${podiumText}\n\nTotal Riders: ${raceState.riders.filter(r => r.isActive).length}`;

      await Share.share({
        message: shareText,
        title: `${raceState.name} Results`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share results. Please try again.');
    }
  };

  const handleExportResults = () => {
    // This would typically export to CSV or other format
    Alert.alert('Export', 'Export functionality would be implemented here.');
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

  const formatDuration = (startTime: number, endTime: number) => {
    const duration = endTime - startTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
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
  const podiumRiders = getPodiumRiders();
  const sortedRiders = [...activeRiders].sort((a, b) => a.position - b.position);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Race Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Race Summary</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{raceState.name}</Text>
              <Text style={styles.summaryLabel}>Race Name</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{activeRiders.length}</Text>
              <Text style={styles.summaryLabel}>Participants</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{raceState.maxLaps}</Text>
              <Text style={styles.summaryLabel}>Max Laps</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {raceState.startTime && raceState.endTime 
                  ? formatDuration(raceState.startTime, raceState.endTime)
                  : 'N/A'
                }
              </Text>
              <Text style={styles.summaryLabel}>Duration</Text>
            </View>
          </View>

          {raceState.startTime && raceState.endTime && (
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Started:</Text>
              <Text style={styles.timeValue}>
                {new Date(raceState.startTime).toLocaleString()}
              </Text>
              <Text style={styles.timeLabel}>Finished:</Text>
              <Text style={styles.timeValue}>
                {new Date(raceState.endTime).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Podium */}
        {podiumRiders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Podium</Text>
            
            <View style={styles.podiumContainer}>
              {podiumRiders.map((rider, index) => (
                <View key={rider.id} style={[styles.podiumItem, styles[`podium${index + 1}`]]}>
                  <View style={styles.podiumPosition}>
                    <Text style={styles.podiumPositionText}>{getPositionIcon(rider.position)}</Text>
                  </View>
                  <Text style={styles.podiumNumber}>#{rider.number}</Text>
                  <Text style={styles.podiumName}>{rider.name}</Text>
                  <Text style={styles.podiumLaps}>{rider.laps} laps</Text>
                  {rider.laps > 0 && (
                    <Text style={styles.podiumTime}>
                      {new Date(rider.lastCrossingTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShareResults}>
            <Icon name="share-variant" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Share Results</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleExportResults}>
            <Icon name="download" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Export Results</Text>
          </TouchableOpacity>
        </View>

        {/* All Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Complete Results</Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowAllResults(!showAllResults)}
            >
              <Icon 
                name={showAllResults ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#2563eb" 
              />
            </TouchableOpacity>
          </View>

          {showAllResults && (
            <View style={styles.resultsTable}>
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
              {sortedRiders.map((rider) => (
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
            </View>
          )}
        </View>

        {/* No Results Message */}
        {activeRiders.length === 0 && (
          <View style={styles.section}>
            <View style={styles.noResultsContainer}>
              <Icon name="flag-off" size={48} color="#9ca3af" />
              <Text style={styles.noResultsText}>No race results available</Text>
              <Text style={styles.noResultsSubtext}>
                Start a race and complete some laps to see results here
              </Text>
            </View>
          </View>
        )}
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
  toggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 15,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  podiumItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  podium1: {
    order: 2,
  },
  podium2: {
    order: 1,
  },
  podium3: {
    order: 3,
  },
  podiumPosition: {
    marginBottom: 10,
  },
  podiumPositionText: {
    fontSize: 32,
  },
  podiumNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
    maxWidth: 80,
  },
  podiumLaps: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  podiumTime: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
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
  secondaryButton: {
    backgroundColor: '#10b981',
  },
  resultsTable: {
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
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
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
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
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
    fontWeight: '600',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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

export default ResultsScreen;


