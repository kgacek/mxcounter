const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Enable CORS
app.use(cors());
app.use(express.json());

// Data persistence functions
const DATA_FILE = path.join(__dirname, 'race_data.json');
const RESULTS_FILE = path.join(__dirname, 'final_results.html');
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const DOCS_INDEX = path.join(DOCS_DIR, 'index.html');

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
      // First sort by number of laps (descending)
      if (a.laps !== b.laps) return b.laps - a.laps;
      // Then by total time + penalties (ascending)
      const at = (a.totalTime || 0) + (a.penaltyMs || 0);
      const bt = (b.totalTime || 0) + (b.penaltyMs || 0);
      if (at !== bt) return at - bt;
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
      const at = (a.totalTime || 0) + (a.penaltyMs || 0);
      const bt = (b.totalTime || 0) + (b.penaltyMs || 0);
      if (at !== bt) return at - bt;
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

function generateFinalResultsHTML(race) {
  const startTime = race.startTime ? new Date(race.startTime).toLocaleString() : 'Not started';
  const raceName = race.name || 'Unknown Race';
  
  // Group riders by class and sort them
  const ridersByClass = {};
  race.riders.forEach(rider => {
    if (!ridersByClass[rider.class]) {
      ridersByClass[rider.class] = [];
    }
    ridersByClass[rider.class].push(rider);
  });

  let html = `
    <div class="race-result">
      <h2>${raceName} - start: ${startTime}</h2>
  `;

  Object.keys(ridersByClass).forEach(className => {
    const classRiders = ridersByClass[className].sort((a, b) => {
      if (a.laps !== b.laps) return b.laps - a.laps;
      if (a.totalTime !== b.totalTime) return a.totalTime - b.totalTime;
      return 0;
    });

    html += `
      <h3>Klasa ${className}</h3>
      <table class="results-table">
        <thead>
          <tr>
            <th>Pozycja</th>
            <th>Imię</th>
            <th>Czasy Okrążeń</th>
            <th>Łączny Czas</th>
            <th>Średni Czas</th>
            <th>Kara</th>
          </tr>
        </thead>
        <tbody>
    `;

    classRiders.forEach((rider, index) => {
      const position = index + 1;
      const lapTimesStr = rider.lapTimes && rider.lapTimes.length > 0 
        ? rider.lapTimes.map(time => formatLapTime(time)).join(', ')
        : 'Brak okrążeń';
      const totalWithPen = (rider.totalTime || 0) + (rider.penaltyMs || 0);
      const totalTimeStr = formatLapTime(totalWithPen);
      const penaltyStr = rider.penaltyMs ? ` (+${formatLapTime(rider.penaltyMs)})` : '';
      const displayName = `${rider.name}#${rider.number}`;
      const avgMs = rider.laps > 0 ? Math.floor(totalWithPen / rider.laps) : null;
      const avgStr = avgMs ? formatLapTime(avgMs) : '--:--';

      html += `
        <tr>
          <td class="position">${position}</td>
          <td class="name">${displayName}</td>
          <td class="lap-times">${lapTimesStr}</td>
          <td class="total-time">${totalTimeStr}${penaltyStr}</td>
          <td class="avg-time">${avgStr}</td>
          <td class="penalty-time">${rider.penaltyMs ? '+' + formatLapTime(rider.penaltyMs) : '--:--'}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;
  });

  html += `</div>`;
  return html;
}

function formatLapTime(duration) {
  if (!duration) return '--:--';
  
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function appendFinalResults(race) {
  try {
    const resultsHTML = generateFinalResultsHTML(race);
    
    let existingContent = '';
    let isNewFile = false;
    
    if (fs.existsSync(RESULTS_FILE)) {
      existingContent = fs.readFileSync(RESULTS_FILE, 'utf8');
    } else {
      isNewFile = true;
    }

    const baseHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Wyniki Końcowe - MxCounter</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; text-align: center; margin-bottom: 30px; }
    .race-result { background: white; margin-bottom: 30px; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .race-result h2 { color: #2196F3; margin-bottom: 20px; border-bottom: 2px solid #2196F3; padding-bottom: 10px; }
    .race-result h3 { color: #FFD700; margin: 20px 0 10px 0; }
    .results-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .results-table th, .results-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    .results-table th { background-color: #f8f9fa; font-weight: bold; color: #333; }
    .results-table tr:hover { background-color: #f5f5f5; }
    .position { font-weight: bold; color: #2196F3; }
    .name { font-weight: 600; }
    .lap-times { font-family: 'Courier New', monospace; font-size: 0.9em; }
    .total-time { font-family: 'Courier New', monospace; font-weight: bold; color: #4CAF50; }
    .no-results { text-align: center; color: #666; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Wyniki Końcowe</h1>
`;

    const closingHTML = `
  </div>
</body>
</html>`;

    let newContent;
    
    if (isNewFile) {
      // Create new file with first results
      newContent = baseHTML + resultsHTML + closingHTML;
    } else {
      // Extract existing race results from the file
      const startMarker = '<h1>Wyniki Końcowe</h1>';
      const endMarker = '</div>';
      
      const startIndex = existingContent.indexOf(startMarker);
      const endIndex = existingContent.lastIndexOf(endMarker);
      
      if (startIndex !== -1 && endIndex !== -1) {
        // Extract existing content between the markers
        const existingResults = existingContent.substring(startIndex + startMarker.length, endIndex);
        // Create new content with existing results + new results
        newContent = baseHTML + existingResults + resultsHTML + closingHTML;
      } else {
        // Fallback: create new file
        newContent = baseHTML + resultsHTML + closingHTML;
      }
    }
    
    fs.writeFileSync(RESULTS_FILE, newContent);

    // Also copy to docs/index.html for GitHub Pages
    try {
      if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR, { recursive: true });
      }
      fs.writeFileSync(DOCS_INDEX, newContent);

      // Git commit and push (assumes SSH auth configured)
      const repoRoot = path.join(__dirname, '..');
      const commitMsg = `"Update final results: ${new Date().toISOString()}"`;
      const cmd = `git add docs/index.html && git commit -m ${commitMsg} || echo "No changes" && git push`;
      exec(cmd, { cwd: repoRoot }, (err, stdout, stderr) => {
        if (err) {
          console.error('Git update failed:', err.message);
        }
        if (stdout) console.log(stdout.trim());
        if (stderr) console.error(stderr.trim());
      });
    } catch (e) {
      console.error('Failed to update GitHub Pages docs:', e);
    }
    console.log(`Final results appended for race: ${race.name}`);
  } catch (error) {
    console.error('Error appending final results:', error);
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
            classes: [],
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
              class: (data.class || '').trim(),
              laps: 0,
              position: currentRace.riders.length + 1,
              lapTimes: [],
              totalTime: 0,
              lastLapTime: null,
              previousLapTime: null,
              isActive: true,
              penaltyMs: 0
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
                if (raceForLap.startTime) {
                  // For the first lap, calculate time from race start to first lap completion
                  if (rider.laps === 0) {
                    lapDuration = currentTime - raceForLap.startTime;
                  } else {
                    // For subsequent laps, calculate time from previous lap completion to current lap completion
                    lapDuration = currentTime - rider.lastLapTime;
                  }
                }
                
                // Add the lap duration to the lapTimes array
                const newLapTimes = [...(rider.lapTimes || []), lapDuration];
                
                // Calculate total time by summing all lap times
                const newTotalTime = newLapTimes.reduce((sum, time) => sum + (time || 0), 0);
                
                return {
                  ...rider,
                  laps: rider.laps + 1,
                  lapTimes: newLapTimes,
                  totalTime: newTotalTime,
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
                // Remove the last lap time from the array
                const newLapTimes = [...(rider.lapTimes || [])];
                const removedLapTime = newLapTimes.pop();
                
                // Calculate new total time by summing remaining lap times
                const newTotalTime = newLapTimes.reduce((sum, time) => sum + (time || 0), 0);
                
                // Update previousLapTime to the last remaining lap time
                const newPreviousLapTime = newLapTimes.length > 0 ? newLapTimes[newLapTimes.length - 1] : null;
                
                // Calculate the new lastLapTime based on remaining laps
                let newLastLapTime = null;
                if (newLapTimes.length > 0 && raceForRemoveLap.startTime) {
                  // If there are remaining laps, calculate when the last lap was completed
                  // by working backwards from the race start time
                  let cumulativeTime = raceForRemoveLap.startTime;
                  newLapTimes.forEach(lapTime => {
                    cumulativeTime += lapTime;
                  });
                  newLastLapTime = cumulativeTime;
                } else if (raceForRemoveLap.startTime) {
                  // If no laps remaining, set lastLapTime to race start time
                  newLastLapTime = raceForRemoveLap.startTime;
                }
                
                return {
                  ...rider,
                  laps: rider.laps - 1,
                  lapTimes: newLapTimes,
                  totalTime: newTotalTime,
                  previousLapTime: newPreviousLapTime,
                  lastLapTime: newLastLapTime
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

        case 'finishRace':
          const raceToFinish = getCurrentRace();
          if (raceToFinish) {
            raceToFinish.isRunning = false;
            
            // Generate and append final results to HTML file
            appendFinalResults(raceToFinish);
            
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
              lapTimes: [],
              totalTime: 0,
              lastLapTime: null,
              previousLapTime: null,
              position: rider.id.charCodeAt(0) % (raceToReset.riders.length || 1) + 1
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

        case 'addClass':
          const raceForAddClass = getCurrentRace();
          if (raceForAddClass) {
            const name = (data.name || '').trim();
            if (name) {
              raceForAddClass.classes = raceForAddClass.classes || [];
              if (!raceForAddClass.classes.includes(name)) {
                raceForAddClass.classes.push(name);
                saveData();
                broadcast({ type: 'state', data: raceState });
              }
            }
          }
          break;

        case 'removeClass':
          const raceForRemoveClass = getCurrentRace();
          if (raceForRemoveClass && Array.isArray(raceForRemoveClass.classes)) {
            const name = (data.name || '').trim();
            raceForRemoveClass.classes = raceForRemoveClass.classes.filter(c => c !== name);
            // Also clear class from riders that had this class
            raceForRemoveClass.riders = raceForRemoveClass.riders.map(r => (
              r.class === name ? { ...r, class: '' } : r
            ));
            saveData();
            broadcast({ type: 'state', data: raceState });
          }
          break;

        case 'addPenalty':
          const raceForPenalty = getCurrentRace();
          if (raceForPenalty) {
            raceForPenalty.riders = raceForPenalty.riders.map(r => {
              if (r.id === data.riderId) {
                return { ...r, penaltyMs: (r.penaltyMs || 0) + 5000 };
              }
              return r;
            });
            updatePositionsOnly(raceForPenalty);
            saveData();
            broadcast({ type: 'state', data: raceState });
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

// Final results endpoint
app.get('/final_results', (req, res) => {
  try {
    if (fs.existsSync(RESULTS_FILE)) {
      res.sendFile(RESULTS_FILE);
    } else {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Wyniki Końcowe - MxCounter</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            h1 { color: #333; text-align: center; }
            .no-results { text-align: center; color: #666; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Wyniki Końcowe</h1>
            <div class="no-results">Brak wyników wyścigów.</div>
          </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error serving final results:', error);
    res.status(500).send('Błąd ładowania wyników końcowych');
  }
});

// Viewer results endpoint - serves SPA and App renders viewer mode on this path
app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
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
  console.log(`Network access: http://<host_ip>:${PORT}`);
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
