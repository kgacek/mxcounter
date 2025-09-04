export interface Rider {
  id: string;
  number: string;
  name: string;
  class: 'Junior' | 'Cross' | 'Quad';
  laps: number;
  position: number;
  lastLapTime: number | null; // Time when the lap was completed
  previousLapTime: number | null; // Time of the previous lap (for display)
  isActive: boolean;
}

export interface Race {
  id: string;
  name: string;
  riders: Rider[];
  isRunning: boolean;
  startTime: number | null;
  currentLap: number;
  maxLaps: number;
}

export interface RaceState {
  races: Race[];
  currentRaceId: string | null;
}

class RaceDatabase {
  private state: RaceState = {
    races: [],
    currentRaceId: null
  };

  private listeners: ((state: RaceState) => void)[] = [];
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // Connect to WebSocket server using computer's IP address
      // This allows phones on the same network to connect
      const serverUrl = window.location.hostname === 'localhost'
        ? 'ws://localhost:3001'
        : `ws://${window.location.hostname}:3001`;

      this.ws = new WebSocket(serverUrl);

      this.ws.onopen = () => {
        console.log('Connected to race server');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data as string);
          if (message.type === 'state') {
            this.state = message.data;
            this.notifyListeners();
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from race server');
        this.attemptReconnect();
      };

      this.ws.onerror = (error: Event) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket server:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached. Running in offline mode.');
    }
  }

  private sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  // Get current state
  getState(): RaceState {
    return { ...this.state };
  }

  // Get current race
  getCurrentRace(): Race | null {
    if (!this.state.currentRaceId) return null;
    return this.state.races.find(race => race.id === this.state.currentRaceId) || null;
  }

  // Get current race state for backward compatibility
  getCurrentRaceState(): any {
    const currentRace = this.getCurrentRace();
    if (!currentRace) {
      return {
        riders: [],
        isRunning: false,
        startTime: null,
        currentLap: 0,
        maxLaps: 20
      };
    }
    return currentRace;
  }

  // Create new race
  createRace(name: string): void {
    this.sendMessage({
      type: 'createRace',
      name
    });
  }

  // Select race
  selectRace(raceId: string): void {
    this.sendMessage({
      type: 'selectRace',
      raceId
    });
  }

  // Remove race
  removeRace(raceId: string): void {
    this.sendMessage({
      type: 'removeRace',
      raceId
    });
  }

  // Sort riders
  sortRiders(): void {
    this.sendMessage({
      type: 'sortRiders'
    });
  }

  // Add rider
  addRider(number: string, name: string, riderClass: 'Junior' | 'Cross' | 'Quad' = 'Cross'): void {
    this.sendMessage({
      type: 'addRider',
      number,
      name,
      class: riderClass
    });
  }

  // Remove rider
  removeRider(id: string): void {
    this.sendMessage({
      type: 'removeRider',
      riderId: id
    });
  }

  // Add lap for rider
  addLap(riderId: string): void {
    this.sendMessage({
      type: 'addLap',
      riderId
    });
  }

  // Remove lap for rider
  removeLap(riderId: string): void {
    this.sendMessage({
      type: 'removeLap',
      riderId
    });
  }

  // Start race
  startRace(): void {
    this.sendMessage({
      type: 'startRace'
    });
  }

  // Stop race
  stopRace(): void {
    this.sendMessage({
      type: 'stopRace'
    });
  }

  // Reset race
  resetRace(): void {
    this.sendMessage({
      type: 'resetRace'
    });
  }



  // Subscribe to state changes
  subscribe(listener: (state: RaceState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Disconnect from server
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create singleton instance
export const raceDatabase = new RaceDatabase();
