import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface RaceStatsProps {
  stats: {
    totalRiders: number;
    activeRiders: number;
    leaderLaps: number;
    averageLaps: number;
    raceProgress: number;
  };
}

const RaceStats: React.FC<RaceStatsProps> = ({ stats }) => {
  const getProgressColor = (progress: number) => {
    if (progress < 25) return '#ef4444';
    if (progress < 50) return '#f59e0b';
    if (progress < 75) return '#10b981';
    return '#059669';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsGrid}>
        {/* Total Riders */}
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalRiders}</Text>
          <Text style={styles.statLabel}>Total Riders</Text>
        </View>

        {/* Active Riders */}
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.activeRiders}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        {/* Leader Laps */}
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.leaderLaps}</Text>
          <Text style={styles.statLabel}>Leader</Text>
        </View>

        {/* Average Laps */}
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.averageLaps}</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
      </View>

      {/* Race Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Race Progress</Text>
          <Text style={styles.progressPercentage}>{Math.round(stats.raceProgress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${stats.raceProgress}%`,
                backgroundColor: getProgressColor(stats.raceProgress),
              }
            ]} 
          />
        </View>
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default RaceStats;


