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
  const [bulkLapInput, setBulkLapInput] = useState('');
  const [newClassName, setNewClassName] = useState('');
  // Lock theme to night
  const theme: 'day' | 'night' = 'night';

  useEffect(() => {
    try {
      const path = window.location.pathname;
      const isViewerPath = path === '/results';
      const isOperatorMode = path === '/operator';
      setIsViewerMode(isViewerPath || !isOperatorMode);

      // Force night theme on body
      const root = document.body;
      root.classList.remove('theme-day', 'theme-night');
      root.classList.add('theme-night');

      const unsubscribe = raceDatabase.subscribe((newState) => {
        try {
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

      const checkConnection = () => {
        setIsConnected(true);
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

  const processBulkLap = () => {
    const currentRace = getCurrentRace();
    if (!currentRace || !currentRace.isRunning) {
      setBulkLapInput('');
      return;
    }
    const tokens = bulkLapInput.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return;

    const numbersSet = new Set(tokens);
    getSafeRiders(currentRace)
      .filter(r => numbersSet.has(r.number))
      .forEach(r => addLap(r.id));

    setBulkLapInput('');
  };

  const handleBulkLapSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    processBulkLap();
  };

  const startRace = () => {
    raceDatabase.startRace();
  };

  const finishRace = () => {
    raceDatabase.finishRace();
  };

  const resetRace = () => {
    raceDatabase.resetRace();
  };

  const addClass = () => {
    if (!newClassName.trim()) return;
    raceDatabase.addClass(newClassName.trim());
    setNewClassName('');
  };

  const removeClass = (name: string) => {
    raceDatabase.removeClass(name);
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

  const formatTotalTime = (totalTime: number | null | undefined): string => {
    if (!totalTime || totalTime === 0) return '--:--';
    
    // Convert milliseconds to minutes and seconds
    const minutes = Math.floor(totalTime / 60000);
    const seconds = Math.floor((totalTime % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatLapTimes = (lapTimes: number[] | null | undefined): string => {
    if (!lapTimes || lapTimes.length === 0) return 'No laps';
    
    return lapTimes.map(time => formatLapTime(time)).join(', ');
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
      {isConnected ? 'Połączony' : 'Rozłączony'}
    </div>
  );

    // Operator Mode UI
  const renderOperatorMode = () => {
    const currentRace = getCurrentRace();
    
    return (
      <div className="app">
        <header className="header">
          <h1>MxCounter</h1>
          <p>Motopiknik - Tryb Operatora</p>
          <div className="header-controls">
            <ConnectionStatus />
            <div className="race-selection-header">
              <select 
                value={raceState.currentRaceId || ''} 
                onChange={(e) => selectRace(e.target.value)}
                className="race-select-header"
              >
                <option value="">Wybierz wyścig...</option>
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
                  onClick={finishRace} 
                  disabled={!currentRace.isRunning}
                  className="btn btn-danger"
                >
                  Zakończ
                </button>

              </div>
            )}
            <button 
              onClick={() => setShowRaceSetup(true)} 
              className="btn btn-secondary"
            >
              Konfiguracja Wyścigu
            </button>
            <button 
              onClick={() => setIsViewerMode(true)} 
              className="btn btn-secondary"
            >
              Przełącz na Tryb Widza
            </button>
            <a 
              href="/final_results" 
              target="_blank" 
              className="btn btn-secondary"
              style={{ textDecoration: 'none', color: 'white' }}
            >
              Wyniki Końcowe
            </a>
          </div>
        </header>

        <div className="main-content operator-content">
          {currentRace ? (
            <div className="riders-section">
              <div className="riders-header">
                <h2>Kierowcy ({getSafeRiders(currentRace).length})</h2>
                <button 
                  onClick={sortRiders} 
                  className="btn btn-secondary"
                >
                  Sortuj
                </button>
              </div>
              <div className="bulk-lap-entry" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', width: '100%' }}>
                <input
                  type="text"
                  value={bulkLapInput}
                  onChange={(e) => setBulkLapInput(e.target.value)}
                  onKeyDown={handleBulkLapSubmit}
                  className="input"
                  placeholder="Numery kierowców (oddzielone spacją), Enter = +1 okrążenie"
                  disabled={!currentRace.isRunning}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={processBulkLap}
                  disabled={!currentRace.isRunning}
                  className="btn btn-primary"
                >
                  Wprowadź
                </button>
              </div>
              
              {getSafeRiders(currentRace).length === 0 ? (
                <p className="no-riders">Brak kierowców. Przejdź do Konfiguracji Wyścigu aby dodać kierowców.</p>
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
                          <h3 className="class-group-title">Klasa {className} ({classRiders.length})</h3>
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
                                <div className="rider-laps-row">
                                  <span className="rider-laps-big">{rider.laps}</span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeLap(rider.id);
                                    }}
                                    disabled={!currentRace.isRunning || rider.laps === 0}
                                    className="btn btn-remove-lap btn-inline-minus"
                                  >
                                    -1
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      raceDatabase.addPenalty(rider.id);
                                    }}
                                    disabled={!currentRace.isRunning}
                                    className="btn btn-penalty btn-inline-penalty"
                                  >
                                    +5s
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
              <h2>Brak wybranego wyścigu</h2>
              <p>Wybierz wyścig z listy powyżej lub utwórz nowy wyścig w Konfiguracji Wyścigu.</p>
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
              {currentRace?.isRunning ? 'WYŚCIG W TOKU' : 'WYŚCIG ZATRZYMANY'}
            </span>
          </div>
        </header>

        <div className="results-container">
          {!currentRace || getSafeRiders(currentRace).length === 0 ? (
            <div className="no-data">
              Oczekiwanie na dane wyścigu...
            </div>
          ) : (
            <div className="class-results">
              {Object.keys(ridersByClass).map(className => {
                const classRiders = ridersByClass[className].sort((a, b) => a.position - b.position);
                return (
                  <div key={className} className="class-section">
                    <h2 className="class-title">Klasa {className}</h2>
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>POZ</th>
                          <th>NUMER</th>
                          <th>IMIĘ</th>
                          <th>OKRĄŻENIA</th>
                          <th>ŁĄCZNY CZAS</th>
                          <th>KARA</th>
                          <th>POPRZEDNIE OKRĄŻENIE</th>
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
                            <td className="total-time">{formatTotalTime((rider.totalTime || 0) + (rider.penaltyMs || 0))}</td>
                            <td className="penalty-time">{rider.penaltyMs ? `+${formatLapTime(rider.penaltyMs)}` : '--:--'}</td>
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
            <span>Łącznie kierowców: {getSafeRiders(currentRace).length}</span>
            <span>Start wyścigu: {currentRace?.startTime ? formatTime(currentRace.startTime) : '--:--'}</span>
            <span>Aktualne okrążenie: {currentRace?.currentLap || 0}</span>
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
          <h1>MxCounter - Konfiguracja Wyścigu</h1>
          <div className="header-controls">
            <ConnectionStatus />
            <button 
              onClick={() => setShowRaceSetup(false)} 
              className="btn btn-secondary"
            >
              Powrót do Trybu Operatora
            </button>
          </div>
        </header>

        <div className="main-content race-setup-content">
          <div className="setup-section">
            <h2>Utwórz Nowy Wyścig</h2>
            <div className="add-race-form">
              <input
                type="text"
                placeholder="Nazwa wyścigu"
                value={newRaceName}
                onChange={(e) => setNewRaceName(e.target.value)}
                className="input"
              />
              <button onClick={createRace} className="btn btn-primary">Utwórz Wyścig</button>
            </div>
          </div>

          <div className="setup-section">
            <h2>Klasy wyścigu</h2>
            <div className="add-race-form">
              <input
                type="text"
                placeholder="Nazwa klasy (np. Junior, Cross, Quad)"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="input"
              />
              <button onClick={addClass} className="btn btn-primary">Dodaj klasę</button>
            </div>
            <div className="races-list">
              {(currentRace?.classes || []).length === 0 ? (
                <div className="no-data">Brak zdefiniowanych klas.</div>
              ) : (
                (currentRace?.classes || []).map((cls) => (
                  <div key={cls} className="race-item">
                    <span className="race-name">{cls}</span>
                    <div className="race-actions">
                      <button onClick={() => removeClass(cls)} className="btn btn-danger">Usuń</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="races-section">
            <h2>Dostępne Wyścigi</h2>
            <div className="races-list">
              {(raceState.races || []).map((race) => (
                <div key={race.id} className="race-item">
                  <span className="race-name">{race.name}</span>
                  <span className="race-riders">({race.riders?.length || 0} kierowców)</span>
                  <div className="race-actions">
                    <button 
                      onClick={() => selectRace(race.id)}
                      className={`btn ${raceState.currentRaceId === race.id ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {raceState.currentRaceId === race.id ? 'Wybrany' : 'Wybierz'}
                    </button>
                    <button 
                      onClick={() => resetRace()}
                      className="btn btn-warning"
                      disabled={!race.isRunning && getSafeRiders(race).length === 0}
                    >
                      Resetuj
                    </button>
                    <button 
                      onClick={() => removeRace(race.id)}
                      className="btn btn-danger"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentRace && (
            <div className="riders-setup-section">
              <h2>Dodaj Kierowców do {currentRace.name}</h2>
              
              <div className="add-rider-form">
                <input
                  type="text"
                  placeholder="Numer kierowcy"
                  value={newRiderNumber}
                  onChange={(e) => setNewRiderNumber(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Imię kierowcy"
                  value={newRiderName}
                  onChange={(e) => setNewRiderName(e.target.value)}
                  className="input"
                />
                <select
                  value={newRiderClass}
                  onChange={(e) => setNewRiderClass(e.target.value as any)}
                  className="input"
                >
                  <option value="">(bez klasy)</option>
                  {(currentRace?.classes || []).map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                <button onClick={addRider} className="btn btn-primary">Dodaj Kierowcę</button>
              </div>

              <div className="riders-table">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>NUMER</th>
                      <th>IMIĘ</th>
                      <th>KLASA</th>
                      <th>AKCJE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSafeRiders(currentRace).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="no-data">
                          Brak dodanych kierowców.
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
                              Usuń
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
          <p>Błąd ładowania aplikacji</p>
        </header>
        <div className="main-content">
          <div className="setup-section">
            <h2>Błąd</h2>
            <p>Wystąpił błąd podczas ładowania aplikacji. Odśwież stronę.</p>
            <pre>{error instanceof Error ? error.message : String(error)}</pre>
          </div>
        </div>
      </div>
    );
  }
};

export default App;
