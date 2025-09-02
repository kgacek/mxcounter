import { Rider, LapAction, RaceState } from '../types';

export class RaceLogic {
  // Increment lap for a rider
  static incrementLap(riders: Rider[], riderId: string): { riders: Rider[]; action: LapAction } {
    const updatedRiders = riders.map(rider => {
      if (rider.id === riderId) {
        return {
          ...rider,
          laps: rider.laps + 1,
          lastCrossingTime: Date.now(),
        };
      }
      return rider;
    });

    const rider = updatedRiders.find(r => r.id === riderId);
    if (!rider) throw new Error('Rider not found');

    const action: LapAction = {
      id: Date.now().toString(),
      riderId,
      riderNumber: rider.number,
      action: 'increment',
      timestamp: Date.now(),
      previousLaps: rider.laps - 1,
      newLaps: rider.laps,
    };

    // Don't move rider to end of list - keep current order
    // Just update positions based on current order
    const ridersWithPositions = updatedRiders.map((rider, index) => ({
      ...rider,
      position: index + 1,
    }));

    return { riders: ridersWithPositions, action };
  }

  // Decrement lap for a rider (undo)
  static decrementLap(riders: Rider[], riderId: string): { riders: Rider[]; action: LapAction } {
    const updatedRiders = riders.map(rider => {
      if (rider.id === riderId && rider.laps > 0) {
        return {
          ...rider,
          laps: rider.laps - 1,
        };
      }
      return rider;
    });

    const rider = updatedRiders.find(r => r.id === riderId);
    if (!rider) throw new Error('Rider not found');

    const action: LapAction = {
      id: Date.now().toString(),
      riderId,
      riderNumber: rider.number,
      action: 'decrement',
      timestamp: Date.now(),
      previousLaps: rider.laps + 1,
      newLaps: rider.laps,
    };

    // Update positions
    const ridersWithPositions = this.updatePositions(updatedRiders);

    return { riders: ridersWithPositions, action };
  }

  // Update positions based on laps and last crossing time
  static updatePositions(riders: Rider[]): Rider[] {
    const sortedRiders = [...riders].sort((a, b) => {
      // First sort by laps (descending)
      if (b.laps !== a.laps) {
        return b.laps - a.laps;
      }
      // Then by last crossing time (ascending - earlier crossing = better position)
      return a.lastCrossingTime - b.lastCrossingTime;
    });

    return sortedRiders.map((rider, index) => ({
      ...rider,
      position: index + 1,
    }));
  }

  // Calculate race statistics
  static getRaceStats(riders: Rider[]): {
    totalRiders: number;
    activeRiders: number;
    leaderLaps: number;
    averageLaps: number;
    raceProgress: number;
  } {
    const activeRiders = riders.filter(r => r.isActive);
    const totalRiders = riders.length;
    const activeCount = activeRiders.length;

    if (activeCount === 0) {
      return {
        totalRiders,
        activeRiders: 0,
        leaderLaps: 0,
        averageLaps: 0,
        raceProgress: 0,
      };
    }

    const leaderLaps = Math.max(...activeRiders.map(r => r.laps));
    const totalLaps = activeRiders.reduce((sum, r) => sum + r.laps, 0);
    const averageLaps = totalLaps / activeCount;

    // Calculate race progress based on leader's laps vs expected race length
    const raceProgress = Math.min((leaderLaps / 20) * 100, 100); // Assuming 20 laps is a full race

    return {
      totalRiders,
      activeRiders: activeCount,
      leaderLaps,
      averageLaps: Math.round(averageLaps * 100) / 100,
      raceProgress,
    };
  }

  // Check if race is finished
  static isRaceFinished(riders: Rider[], maxLaps: number): boolean {
    const activeRiders = riders.filter(r => r.isActive);
    if (activeRiders.length === 0) return false;

    const leaderLaps = Math.max(...activeRiders.map(r => r.laps));
    return leaderLaps >= maxLaps;
  }

  // Get podium riders
  static getPodiumRiders(riders: Rider[]): Rider[] {
    return riders
      .filter(r => r.isActive)
      .sort((a, b) => a.position - b.position)
      .slice(0, 3);
  }

  // Generate sample riders for testing
  static generateSampleRiders(count: number): Rider[] {
    const riders: Rider[] = [];
    const now = Date.now();

    for (let i = 1; i <= count; i++) {
      const number = i.toString().padStart(3, '0');
      riders.push({
        id: `rider_${i}`,
        number,
        name: `Rider ${number}`,
        laps: 0,
        lastCrossingTime: now,
        position: i,
        isActive: true,
      });
    }

    return riders;
  }

  // Import riders from CSV data
  static importRiders(csvData: string): Omit<Rider, 'id' | 'laps' | 'lastCrossingTime' | 'position' | 'isActive'>[] {
    const lines = csvData.trim().split('\n');
    const riders: Omit<Rider, 'id' | 'laps' | 'lastCrossingTime' | 'position' | 'isActive'>[] = [];

    // Skip header if present
    const startIndex = lines[0].includes('Number') || lines[0].includes('Name') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [number, name] = line.split(',').map(s => s.trim());
      if (number && name) {
        riders.push({
          number: number.padStart(3, '0'),
          name,
        });
      }
    }

    return riders;
  }

  // Export riders to CSV format
  static exportRidersToCSV(riders: Rider[]): string {
    const header = 'Number,Name,Laps,Position,Last Crossing\n';
    const rows = riders
      .filter(r => r.isActive)
      .map(rider => {
        const lastCrossing = new Date(rider.lastCrossingTime).toLocaleTimeString();
        return `${rider.number},${rider.name},${rider.laps},${rider.position},${lastCrossing}`;
      })
      .join('\n');

    return header + rows;
  }
}

