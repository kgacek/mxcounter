const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Enable CORS
app.use(cors());
app.use(express.json());

// Data persistence functions
const DATA_FILE = 'race_data.json';

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(raceState, null, 2));
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const loadedState = JSON.parse(data);
      
      // Validate the loaded data structure
      if (loadedState.races && Array.isArray(loadedState.races)) {
        raceState = loadedState;
        console.log('Data loaded successfully');
        console.log(`Loaded ${raceState.races.length} races`);
        
        // Validate current race ID
        if (raceState.currentRaceId) {
          const currentRaceExists = raceState.races.find(race => race.id === raceState.currentRaceId);
          if (!currentRaceExists) {
            raceState.currentRaceId = raceState.races.length > 0 ? raceState.races[0].id : null;
          }
        }
      } else {
        console.log('Invalid data structure, creating default state');
        createDefaultState();
      }
    } else {
      console.log('No data file found, creating default state');
      createDefaultState();
    }
  } catch (error) {
    console.error('Error loading data:', error);
    createDefaultState();
  }
}

function createDefaultState() {
  const defaultRace = {
    id: 'default',
    name: 'Default Race',
    riders: [],
    isRunning: false,
    startTime: null,
    currentLap: 0,
    maxLaps: 20
  };
  
  raceState = {
    races: [defaultRace],
    currentRaceId: defaultRace.id
  };
  
  saveData();
}

// Global race state
let raceState = {
  races: [],
  currentRaceId: null
};

// Load data on startup
loadData();

// Connected clients
const clients = new Set();

// Helper functions
function getCurrentRace() {
  if (!raceState.currentRaceId) return null;
  return raceState.races.find(race => race.id === raceState.currentRaceId);
}

function updatePositionsOnly(race) {
  // Group riders by class
  const ridersByClass = {};
  race.riders.forEach(rider => {
    if (!ridersByClass[rider.class]) {
      ridersByClass[rider.class] = [];
    }
    ridersByClass[rider.class].push(rider);
  });

  // Update positions for each class separately without changing array order
  Object.keys(ridersByClass).forEach(className => {
    const classRiders = ridersByClass[className];
    const sortedClassRiders = classRiders.sort((a, b) => {
      if (a.laps !== b.laps) return b.laps - a.laps;
      if (a.lastLapTime && b.lastLapTime) return a.lastLapTime - b.lastLapTime;
      return 0;
    });

    // Update positions for this class without changing array order
    sortedClassRiders.forEach((rider, index) => {
      const riderIndex = race.riders.findIndex(r => r.id === rider.id);
      if (riderIndex !== -1) {
        race.riders[riderIndex] = {
          ...race.riders[riderIndex],
          position: index + 1
        };
      }
    });
  });
}

function updatePositions(race) {
  // Group riders by class
  const ridersByClass = {};
  race.riders.forEach(rider => {
    if (!ridersByClass[rider.class]) {
      ridersByClass[rider.class] = [];
    }
    ridersByClass[rider.class].push(rider);
  });

  // Create a new sorted riders array
  const sortedRiders = [];

  // Sort each class and add to the sorted array
  Object.keys(ridersByClass).forEach(className => {
    const classRiders = ridersByClass[className];
    const sortedClassRiders = classRiders.sort((a, b) => {
      if (a.laps !== b.laps) return b.laps - a.laps;
      if (a.lastLapTime && b.lastLapTime) return a.lastLapTime - b.lastLapTime;
      return 0;
    });

    // Update positions and add to sorted array
    sortedClassRiders.forEach((rider, index) => {
      sortedRiders.push({
        ...rider,
        position: index + 1
      });
    });
  });

  // Replace the riders array with the sorted one
  race.riders = sortedRiders;
}

function updateCurrentLap(race) {
  if (race.riders.length === 0) {
    race.currentLap = 0;
  } else {
    const maxLaps = Math.max(...race.riders.map(rider => rider.laps), 0);
    race.currentLap = maxLaps;
  }
}

// Broadcast to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);

  // Send current state to new client
  ws.send(JSON.stringify({
    type: 'state',
    data: raceState
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      switch (data.type) {
        case 'createRace':
          const newRace = {
            id: Date.now().toString(),
            name: data.name.trim(),
            riders: [],
            isRunning: false,
            startTime: null,
            currentLap: 0,
            maxLaps: 20
          };
          raceState.races.push(newRace);
          if (!raceState.currentRaceId) {
            raceState.currentRaceId = newRace.id;
          }
          saveData();
          broadcast({
            type: 'state',
            data: raceState
          });
          break;

        case 'selectRace':
          raceState.currentRaceId = data.raceId;
          saveData();
          broadcast({
            type: 'state',
            data: raceState
          });
          break;

        case 'removeRace':
          // Remove the race from the races array
          raceState.races = raceState.races.filter(race => race.id !== data.raceId);
          
          // If the removed race was the current race, select the first available race or null
          if (raceState.currentRaceId === data.raceId) {
            raceState.currentRaceId = raceState.races.length > 0 ? raceState.races[0].id : null;
          }
          
          saveData();
          broadcast({
            type: 'state',
            data: raceState
          });
          break;

        case 'addRider':
          const currentRace = getCurrentRace();
          if (currentRace) {
            const newRider = {
              id: Date.now().toString(),
              number: data.number.trim(),
              name: data.name.trim(),
              class: data.class || 'Cross',
              laps: 0,
              position: currentRace.riders.length + 1,
              lastLapTime: null,
              previousLapTime: null,
              isActive: true
            };
            currentRace.riders.push(newRider);
            updateCurrentLap(currentRace);
            saveData();
            broadcast({
              type: 'state',
              data: raceState
            });
          }
          break;

        case 'removeRider':
          const raceForRemoval = getCurrentRace();
          if (raceForRemoval) {
            raceForRemoval.riders = raceForRemoval.riders.filter(rider => rider.id !== data.riderId);
            updatePositions(raceForRemoval);
            updateCurrentLap(raceForRemoval);
            saveData();
            broadcast({
              type: 'state',
              data: raceState
            });
          }
          break;

        case 'addLap':
          const raceForLap = getCurrentRace();
          if (raceForLap && raceForLap.isRunning) {
            const currentTime = Date.now();
            raceForLap.riders = raceForLap.riders.map(rider => {
              if (rider.id === data.riderId) {
                // Calculate the duration of the lap that was just completed
                let lapDuration = null;
                if (rider.lastLapTime && raceForLap.startTime) {
                  // For the first lap, calculate time from race start to first lap completion
                  if (rider.laps === 0) {
                    lapDuration = currentTime - raceForLap.startTime;
                  } else {
                    // For subsequent laps, calculate time from previous lap completion to current lap completion
                    lapDuration = currentTime - rider.lastLapTime;
                  }
                }
                
                return {
                  ...rider,
                  laps: rider.laps + 1,
                  previousLapTime: lapDuration, // Store the duration of the completed lap
                  lastLapTime: currentTime // Set new current lap time
                };
              }
              return rider;
            });
            updatePositionsOnly(raceForLap);
            updateCurrentLap(raceForLap);
            saveData();
            broadcast({
              type: 'state',
              data: raceState
            });
          }
          break;

        case 'removeLap':
          const raceForRemoveLap = getCurrentRace();
          if (raceForRemoveLap && raceForRemoveLap.isRunning) {
            raceForRemoveLap.riders = raceForRemoveLap.riders.map(rider => {
              if (rider.id === data.riderId && rider.laps > 0) {
                return {
                  ...rider,
                  laps: rider.laps - 1,
                  // Note: We don't recalculate previousLapTime here as it would be complex
                  // The previous lap time will remain as the last completed lap
                };
              }
              return rider;
            });
            updatePositionsOnly(raceForRemoveLap);
            updateCurrentLap(raceForRemoveLap);
            saveData();
            broadcast({
              type: 'state',
              data: raceState
            });
          }
          break;

        case 'startRace':
          const raceToStart = getCurrentRace();
          if (raceToStart && raceToStart.riders.length > 0) {
            raceToStart.isRunning = true;
            raceToStart.startTime = Date.now();
            updateCurrentLap(raceToStart);
            saveData();
            broadcast({
              type: 'state',
              data: raceState
            });
          }
          break;

        case 'stopRace':
          const raceToStop = getCurrentRace();
          if (raceToStop) {
            raceToStop.isRunning = false;
            saveData();
            broadcast({
              type: 'state',
              data: raceState
            });
          }
          break;

        case 'resetRace':
          const raceToReset = getCurrentRace();
          if (raceToReset) {
            raceToReset.riders = raceToReset.riders.map(rider => ({
              ...rider,
              laps: 0,
              lastLapTime: null,
              previousLapTime: null,
              position: rider.id.charCodeAt(0) % raceToReset.riders.length + 1
            }));
            raceToReset.isRunning = false;
            raceToReset.startTime = null;
            raceToReset.currentLap = 0;
            saveData();
            broadcast({
              type: 'state',
              data: raceState
            });
          }
          break;

        case 'sortRiders':
          const raceToSort = getCurrentRace();
          if (raceToSort) {
            updatePositions(raceToSort);
            saveData();
            broadcast({
              type: 'state',
              data: raceState
            });
          }
          break;


      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});



// REST API endpoints for debugging/testing
app.get('/api/state', (req, res) => {
  res.json(raceState);
});

app.get('/api/clients', (req, res) => {
  res.json({ connectedClients: clients.size });
});

app.post('/api/save', (req, res) => {
  saveData();
  res.json({ success: true, message: 'Data saved successfully' });
});

app.get('/api/data-file', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const stats = fs.statSync(DATA_FILE);
      res.json({
        exists: true,
        size: stats.size,
        lastModified: stats.mtime,
        path: DATA_FILE
      });
    } else {
      res.json({ exists: false, path: DATA_FILE });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operator endpoint - redirects to main app with operator mode
app.get('/operator', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Serve static files from the main project
app.use(express.static(path.join(__dirname, '../dist')));

// Serve the main app for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 8765;
const HOST = '0.0.0.0'; // Bind to all network interfaces

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`Web app available at http://localhost:${PORT}`);
  console.log(`Operator mode: http://localhost:${PORT}/operator`);
  console.log(`Network access: http://${getLocalIP()}:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nSaving data before shutdown...');
  saveData();
  console.log('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nSaving data before shutdown...');
  saveData();
  console.log('Shutting down gracefully...');
  process.exit(0);
});
