import React, { useState, useEffect } from 'react';
import { raceDatabase, RaceState, Race } from './shared/database';
import './App.css';

const App: React.FC = () => {
  const [raceState, setRaceState] = useState<RaceState>(() => {
    try {
      const state = raceDatabase.getState();
      // Ensure the state has the correct structure
      if (!state.races) {
        return { races: [], currentRaceId: null };
      }
      return state;
    } catch (error) {
      console.error('Error getting initial state:', error);
      return { races: [], currentRaceId: null };
    }
  });
  const [isViewerMode, setIsViewerMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showRaceSetup, setShowRaceSetup] = useState(false);
  const [newRiderNumber, setNewRiderNumber] = useState('');
  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderClass, setNewRiderClass] = useState<'Junior' | 'Cross' | 'Quad'>('Cross');
  const [newRaceName, setNewRaceName] = useState('');

  useEffect(() => {
    try {
      // Check if we're in operator mode based on URL
      const isOperatorMode = window.location.pathname === '/operator';
      setIsViewerMode(!isOperatorMode);
      
      // Subscribe to database changes
      const unsubscribe = raceDatabase.subscribe((newState) => {
        try {
          // Ensure the new state has the correct structure
          if (!newState.races) {
            console.warn('Received invalid state structure:', newState);
            setRaceState({ races: [], currentRaceId: null });
            return;
          }
          setRaceState(newState);
        } catch (error) {
          console.error('Error updating state:', error);
        }
      });
      
      // Check connection status periodically
      const checkConnection = () => {
        // This is a simple check - in a real app you'd want to track the actual WebSocket state
        setIsConnected(true); // For now, assume connected if we're getting updates
      };
      
      const connectionInterval = setInterval(checkConnection, 2000);
      
      return () => {
        unsubscribe();
        clearInterval(connectionInterval);
      };
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, []);

  // Helper functions
  const getCurrentRace = (): Race | null => {
    try {
      return raceDatabase.getCurrentRace();
    } catch (error) {
      console.error('Error getting current race:', error);
      return null;
    }
  };

  const getSafeRiders = (race: Race | null) => {
    return race?.riders || [];
  };

  const addRider = () => {
    if (newRiderNumber.trim() && newRiderName.trim()) {
      raceDatabase.addRider(newRiderNumber, newRiderName, newRiderClass);
      setNewRiderNumber('');
      setNewRiderName('');
      setNewRiderClass('Cross');
    }
  };

  const createRace = () => {
    if (newRaceName.trim()) {
      raceDatabase.createRace(newRaceName);
      setNewRaceName('');
    }
  };

  const selectRace = (raceId: string) => {
    raceDatabase.selectRace(raceId);
  };

  const removeRace = (raceId: string) => {
    raceDatabase.removeRace(raceId);
  };

  const sortRiders = () => {
    raceDatabase.sortRiders();
  };

  const removeLap = (riderId: string) => {
    raceDatabase.removeLap(riderId);
  };

  const handleRiderCardClick = (riderId: string, event: React.MouseEvent) => {
    // Don't trigger if clicking on the remove lap button
    if ((event.target as HTMLElement).closest('.btn-remove-lap')) {
      return;
    }
    addLap(riderId);
  };

  const removeRider = (id: string) => {
    raceDatabase.removeRider(id);
  };

  const addLap = (riderId: string) => {
    raceDatabase.addLap(riderId);
  };

  const startRace = () => {
    raceDatabase.startRace();
  };

  const stopRace = () => {
    raceDatabase.stopRace();
  };

  const resetRace = () => {
    raceDatabase.resetRace();
  };



  const formatTime = (timestamp: number | null): string => {
    if (!timestamp) return '--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatLapTime = (duration: number | null): string => {
    if (!duration) return '--:--';
    
    // Convert milliseconds to minutes and seconds
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPositionColor = (position: number): string => {
    switch (position) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#FFFFFF';
    }
  };

  // Connection Status Component
  const ConnectionStatus = () => (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      <span className="status-dot"></span>
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );

    // Operator Mode UI
  const renderOperatorMode = () => {
    const currentRace = getCurrentRace();
    
    return (
      <div className="app">
        <header className="header">
          <h1>MxCounter</h1>
          <p>Motocross Lap Counter - Operator Mode</p>
          <div className="header-controls">
            <ConnectionStatus />
            <div className="race-selection-header">
              <select 
                value={raceState.currentRaceId || ''} 
                onChange={(e) => selectRace(e.target.value)}
                className="race-select-header"
              >
                <option value="">Select a race...</option>
                {(raceState.races || []).map((race) => (
                  <option key={race.id} value={race.id}>
                    {race.name}
                  </option>
                ))}
              </select>
            </div>
            {currentRace && (
              <div className="race-controls-header">
                <button 
                  onClick={startRace} 
                  disabled={!currentRace.isRunning && getSafeRiders(currentRace).length === 0}
                  className="btn btn-success"
                >
                  Start
                </button>
                <button 
                  onClick={stopRace} 
                  disabled={!currentRace.isRunning}
                  className="btn btn-danger"
                >
                  Stop
                </button>

                <button 
                  onClick={sortRiders} 
                  className="btn btn-secondary"
                >
                  Sort
                </button>
              </div>
            )}
            <button 
              onClick={() => setShowRaceSetup(true)} 
              className="btn btn-secondary"
            >
              Race Setup
            </button>
            <button 
              onClick={() => setIsViewerMode(true)} 
              className="btn btn-secondary"
            >
              Switch to Viewer Mode
            </button>
          </div>
        </header>

        <div className="main-content operator-content">
          {currentRace ? (
            <div className="riders-section">
              <h2>Riders ({getSafeRiders(currentRace).length})</h2>
              
              {getSafeRiders(currentRace).length === 0 ? (
                <p className="no-riders">No riders added yet. Go to Race Setup to add riders.</p>
              ) : (
                <div className="riders-by-class">
                  {(() => {
                    const ridersByClass: { [key: string]: any[] } = {};
                    getSafeRiders(currentRace).forEach(rider => {
                      if (!ridersByClass[rider.class]) {
                        ridersByClass[rider.class] = [];
                      }
                      ridersByClass[rider.class].push(rider);
                    });
                    
                    return Object.keys(ridersByClass).map(className => {
                      const classRiders = ridersByClass[className];
                      return (
                        <div key={className} className="class-group">
                          <h3 className="class-group-title">{className} Class ({classRiders.length})</h3>
                          <div className="riders-grid">
                            {classRiders.map((rider) => (
                              <div 
                                key={rider.id} 
                                className={`rider-card ${currentRace.isRunning ? 'clickable' : ''}`}
                                onClick={(e) => currentRace.isRunning && handleRiderCardClick(rider.id, e)}
                              >
                                <div className="rider-header">
                                  <span className="rider-number">#{rider.number}</span>
                                  <span className="rider-position">P{rider.position}</span>
                                </div>
                                <div className="rider-name">{rider.name}</div>
                                <div className="rider-laps">Laps: {rider.laps}</div>
                                <div className="rider-actions">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeLap(rider.id);
                                    }}
                                    disabled={!currentRace.isRunning || rider.laps === 0}
                                    className="btn btn-remove-lap"
                                  >
                                    -1 Lap
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="no-race-selected">
              <h2>No Race Selected</h2>
              <p>Please select a race from the dropdown above or create a new race in Race Setup.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Viewer Mode UI
  const renderViewerMode = () => {
    const currentRace = getCurrentRace();
    
    // Group riders by class
    const ridersByClass: { [key: string]: any[] } = {};
    if (currentRace) {
      getSafeRiders(currentRace).forEach(rider => {
        if (!ridersByClass[rider.class]) {
          ridersByClass[rider.class] = [];
        }
        ridersByClass[rider.class].push(rider);
      });
    }
    
    return (
      <div className="viewer-app">
        <header className="viewer-header">
          <h1>{currentRace?.name || 'MxCounter Live Results'}</h1>
          <div className="race-status">
            <ConnectionStatus />
            <span className={`status-indicator ${currentRace?.isRunning ? 'running' : 'stopped'}`}>
              {currentRace?.isRunning ? 'RACE IN PROGRESS' : 'RACE STOPPED'}
            </span>
          </div>
        </header>

        <div className="results-container">
          {!currentRace || getSafeRiders(currentRace).length === 0 ? (
            <div className="no-data">
              Waiting for race data...
            </div>
          ) : (
            <div className="class-results">
              {Object.keys(ridersByClass).map(className => {
                const classRiders = ridersByClass[className].sort((a, b) => a.position - b.position);
                return (
                  <div key={className} className="class-section">
                    <h2 className="class-title">{className} Class</h2>
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>POS</th>
                          <th>NUMBER</th>
                          <th>NAME</th>
                          <th>LAPS</th>
                          <th>PREVIOUS LAP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classRiders.map((rider) => (
                          <tr key={rider.id} className="rider-row">
                            <td className="position" style={{ color: getPositionColor(rider.position) }}>
                              {rider.position}
                            </td>
                            <td className="number">#{rider.number}</td>
                            <td className="name">{rider.name}</td>
                            <td className="laps">{rider.laps}</td>
                            <td className="last-lap">{formatLapTime(rider.previousLapTime)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer className="viewer-footer">
          <div className="race-info">
            <span>Total Riders: {getSafeRiders(currentRace).length}</span>
            <span>Race Start: {currentRace?.startTime ? formatTime(currentRace.startTime) : '--:--'}</span>
            <span>Current Lap: {currentRace?.currentLap || 0}</span>
          </div>
        </footer>
      </div>
    );
  };

  // Race Setup UI
  const renderRaceSetup = () => {
    const currentRace = getCurrentRace();
    
    return (
      <div className="app">
        <header className="header">
          <h1>MxCounter - Race Setup</h1>
          <div className="header-controls">
            <ConnectionStatus />
            <button 
              onClick={() => setShowRaceSetup(false)} 
              className="btn btn-secondary"
            >
              Back to Operator Mode
            </button>
          </div>
        </header>

        <div className="main-content race-setup-content">
          <div className="setup-section">
            <h2>Create New Race</h2>
            <div className="add-race-form">
              <input
                type="text"
                placeholder="Race Name"
                value={newRaceName}
                onChange={(e) => setNewRaceName(e.target.value)}
                className="input"
              />
              <button onClick={createRace} className="btn btn-primary">Create Race</button>
            </div>
          </div>

          <div className="races-section">
            <h2>Available Races</h2>
            <div className="races-list">
              {(raceState.races || []).map((race) => (
                <div key={race.id} className="race-item">
                  <span className="race-name">{race.name}</span>
                  <span className="race-riders">({race.riders?.length || 0} riders)</span>
                  <div className="race-actions">
                    <button 
                      onClick={() => selectRace(race.id)}
                      className={`btn ${raceState.currentRaceId === race.id ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {raceState.currentRaceId === race.id ? 'Selected' : 'Select'}
                    </button>
                    <button 
                      onClick={() => resetRace()}
                      className="btn btn-warning"
                      disabled={!race.isRunning && getSafeRiders(race).length === 0}
                    >
                      Reset
                    </button>
                    <button 
                      onClick={() => removeRace(race.id)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentRace && (
            <div className="riders-setup-section">
              <h2>Add Riders to {currentRace.name}</h2>
              
              <div className="add-rider-form">
                <input
                  type="text"
                  placeholder="Rider Number"
                  value={newRiderNumber}
                  onChange={(e) => setNewRiderNumber(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Rider Name"
                  value={newRiderName}
                  onChange={(e) => setNewRiderName(e.target.value)}
                  className="input"
                />
                <select
                  value={newRiderClass}
                  onChange={(e) => setNewRiderClass(e.target.value as 'Junior' | 'Cross' | 'Quad')}
                  className="input"
                >
                  <option value="Junior">Junior</option>
                  <option value="Cross">Cross</option>
                  <option value="Quad">Quad</option>
                </select>
                <button onClick={addRider} className="btn btn-primary">Add Rider</button>
              </div>

              <div className="riders-table">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>NUMBER</th>
                      <th>NAME</th>
                      <th>CLASS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSafeRiders(currentRace).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="no-data">
                          No riders added yet.
                        </td>
                      </tr>
                    ) : (
                      getSafeRiders(currentRace).map((rider) => (
                        <tr key={rider.id} className="rider-row">
                          <td className="number">#{rider.number}</td>
                          <td className="name">{rider.name}</td>
                          <td className="class">{rider.class}</td>
                          <td className="actions">
                            <button 
                              onClick={() => removeRider(rider.id)}
                              className="btn btn-remove"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Debug output
  console.log('Current raceState:', raceState);
  console.log('Current race:', getCurrentRace());

  try {
    if (showRaceSetup) {
      return renderRaceSetup();
    }

    return isViewerMode ? renderViewerMode() : renderOperatorMode();
  } catch (error) {
    console.error('Error rendering app:', error);
    return (
      <div className="app">
        <header className="header">
          <h1>MxCounter</h1>
          <p>Error loading application</p>
        </header>
        <div className="main-content">
          <div className="setup-section">
            <h2>Error</h2>
            <p>There was an error loading the application. Please refresh the page.</p>
            <pre>{error instanceof Error ? error.message : String(error)}</pre>
          </div>
        </div>
      </div>
    );
  }
};

export default App;
