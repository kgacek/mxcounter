import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { raceDatabase } from './shared/database';
import './App.css';
var App = function () {
    var _a = useState(function () {
        try {
            var state = raceDatabase.getState();
            // Ensure the state has the correct structure
            if (!state.races) {
                return { races: [], currentRaceId: null };
            }
            return state;
        }
        catch (error) {
            console.error('Error getting initial state:', error);
            return { races: [], currentRaceId: null };
        }
    }), raceState = _a[0], setRaceState = _a[1];
    var _b = useState(false), isViewerMode = _b[0], setIsViewerMode = _b[1];
    var _c = useState(false), isConnected = _c[0], setIsConnected = _c[1];
    var _d = useState(false), showRaceSetup = _d[0], setShowRaceSetup = _d[1];
    var _e = useState(''), newRiderNumber = _e[0], setNewRiderNumber = _e[1];
    var _f = useState(''), newRiderName = _f[0], setNewRiderName = _f[1];
    var _g = useState('Cross'), newRiderClass = _g[0], setNewRiderClass = _g[1];
    var _h = useState(''), newRaceName = _h[0], setNewRaceName = _h[1];
    var _j = useState(''), bulkLapInput = _j[0], setBulkLapInput = _j[1];
    var _k = useState(''), newClassName = _k[0], setNewClassName = _k[1];
    // Lock theme to night
    var theme = 'night';
    useEffect(function () {
        try {
            var isOperatorMode = window.location.pathname === '/operator';
            setIsViewerMode(!isOperatorMode);
            // Force night theme on body
            var root = document.body;
            root.classList.remove('theme-day', 'theme-night');
            root.classList.add('theme-night');
            var unsubscribe_1 = raceDatabase.subscribe(function (newState) {
                try {
                    if (!newState.races) {
                        console.warn('Received invalid state structure:', newState);
                        setRaceState({ races: [], currentRaceId: null });
                        return;
                    }
                    setRaceState(newState);
                }
                catch (error) {
                    console.error('Error updating state:', error);
                }
            });
            var checkConnection = function () {
                setIsConnected(true);
            };
            var connectionInterval_1 = setInterval(checkConnection, 2000);
            return function () {
                unsubscribe_1();
                clearInterval(connectionInterval_1);
            };
        }
        catch (error) {
            console.error('Error in useEffect:', error);
        }
    }, []);
    // Helper functions
    var getCurrentRace = function () {
        try {
            return raceDatabase.getCurrentRace();
        }
        catch (error) {
            console.error('Error getting current race:', error);
            return null;
        }
    };
    var getSafeRiders = function (race) {
        return (race === null || race === void 0 ? void 0 : race.riders) || [];
    };
    var addRider = function () {
        if (newRiderNumber.trim() && newRiderName.trim()) {
            raceDatabase.addRider(newRiderNumber, newRiderName, newRiderClass);
            setNewRiderNumber('');
            setNewRiderName('');
            setNewRiderClass('Cross');
        }
    };
    var createRace = function () {
        if (newRaceName.trim()) {
            raceDatabase.createRace(newRaceName);
            setNewRaceName('');
        }
    };
    var selectRace = function (raceId) {
        raceDatabase.selectRace(raceId);
    };
    var removeRace = function (raceId) {
        raceDatabase.removeRace(raceId);
    };
    var sortRiders = function () {
        raceDatabase.sortRiders();
    };
    var removeLap = function (riderId) {
        raceDatabase.removeLap(riderId);
    };
    var handleRiderCardClick = function (riderId, event) {
        // Don't trigger if clicking on the remove lap button
        if (event.target.closest('.btn-remove-lap')) {
            return;
        }
        addLap(riderId);
    };
    var removeRider = function (id) {
        raceDatabase.removeRider(id);
    };
    var addLap = function (riderId) {
        raceDatabase.addLap(riderId);
    };
    var processBulkLap = function () {
        var currentRace = getCurrentRace();
        if (!currentRace || !currentRace.isRunning) {
            setBulkLapInput('');
            return;
        }
        var tokens = bulkLapInput.trim().split(/\s+/).filter(Boolean);
        if (tokens.length === 0)
            return;
        var numbersSet = new Set(tokens);
        getSafeRiders(currentRace)
            .filter(function (r) { return numbersSet.has(r.number); })
            .forEach(function (r) { return addLap(r.id); });
        setBulkLapInput('');
    };
    var handleBulkLapSubmit = function (e) {
        if (e.key !== 'Enter')
            return;
        processBulkLap();
    };
    var startRace = function () {
        raceDatabase.startRace();
    };
    var finishRace = function () {
        raceDatabase.finishRace();
    };
    var resetRace = function () {
        raceDatabase.resetRace();
    };
    var toggleTheme = function () {
        setTheme(function (prev) { return prev === 'night' ? 'day' : 'night'; });
    };
    var addClass = function () {
        if (!newClassName.trim())
            return;
        raceDatabase.addClass(newClassName.trim());
        setNewClassName('');
    };
    var removeClass = function (name) {
        raceDatabase.removeClass(name);
    };
    var formatTime = function (timestamp) {
        if (!timestamp)
            return '--:--';
        var date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
    var formatLapTime = function (duration) {
        if (!duration)
            return '--:--';
        // Convert milliseconds to minutes and seconds
        var minutes = Math.floor(duration / 60000);
        var seconds = Math.floor((duration % 60000) / 1000);
        return "".concat(minutes, ":").concat(seconds.toString().padStart(2, '0'));
    };
    var formatTotalTime = function (totalTime) {
        if (!totalTime || totalTime === 0)
            return '--:--';
        // Convert milliseconds to minutes and seconds
        var minutes = Math.floor(totalTime / 60000);
        var seconds = Math.floor((totalTime % 60000) / 1000);
        return "".concat(minutes, ":").concat(seconds.toString().padStart(2, '0'));
    };
    var formatLapTimes = function (lapTimes) {
        if (!lapTimes || lapTimes.length === 0)
            return 'No laps';
        return lapTimes.map(function (time) { return formatLapTime(time); }).join(', ');
    };
    var getPositionColor = function (position) {
        switch (position) {
            case 1: return '#FFD700'; // Gold
            case 2: return '#C0C0C0'; // Silver
            case 3: return '#CD7F32'; // Bronze
            default: return '#FFFFFF';
        }
    };
    // Connection Status Component
    var ConnectionStatus = function () { return (_jsxs("div", { className: "connection-status ".concat(isConnected ? 'connected' : 'disconnected'), children: [_jsx("span", { className: "status-dot" }), isConnected ? 'Połączony' : 'Rozłączony'] })); };
    // Operator Mode UI
    var renderOperatorMode = function () {
        var currentRace = getCurrentRace();
        return (_jsxs("div", { className: "app", children: [_jsxs("header", { className: "header", children: [_jsx("h1", { children: "MxCounter" }), _jsx("p", { children: "Motopiknik - Tryb Operatora" }), _jsxs("div", { className: "header-controls", children: [_jsx(ConnectionStatus, {}), _jsx("div", { className: "race-selection-header", children: _jsxs("select", { value: raceState.currentRaceId || '', onChange: function (e) { return selectRace(e.target.value); }, className: "race-select-header", children: [_jsx("option", { value: "", children: "Wybierz wy\u015Bcig..." }), (raceState.races || []).map(function (race) { return (_jsx("option", { value: race.id, children: race.name }, race.id)); })] }) }), currentRace && (_jsxs("div", { className: "race-controls-header", children: [_jsx("button", { onClick: startRace, disabled: !currentRace.isRunning && getSafeRiders(currentRace).length === 0, className: "btn btn-success", children: "Start" }), _jsx("button", { onClick: finishRace, disabled: !currentRace.isRunning, className: "btn btn-danger", children: "Zako\u0144cz" })] })), _jsx("button", { onClick: function () { return setShowRaceSetup(true); }, className: "btn btn-secondary", children: "Konfiguracja Wy\u015Bcigu" }), _jsx("button", { onClick: function () { return setIsViewerMode(true); }, className: "btn btn-secondary", children: "Prze\u0142\u0105cz na Tryb Widza" }), _jsx("a", { href: "/final_results", target: "_blank", className: "btn btn-secondary", style: { textDecoration: 'none', color: 'white' }, children: "Wyniki Ko\u0144cowe" })] })] }), _jsx("div", { className: "main-content operator-content", children: currentRace ? (_jsxs("div", { className: "riders-section", children: [_jsxs("div", { className: "riders-header", children: [_jsxs("h2", { children: ["Kierowcy (", getSafeRiders(currentRace).length, ")"] }), _jsx("button", { onClick: sortRiders, className: "btn btn-secondary", children: "Sortuj" })] }), _jsxs("div", { className: "bulk-lap-entry", style: { marginBottom: '1rem', display: 'flex', gap: '0.5rem', width: '100%' }, children: [_jsx("input", { type: "text", value: bulkLapInput, onChange: function (e) { return setBulkLapInput(e.target.value); }, onKeyDown: handleBulkLapSubmit, className: "input", placeholder: "Numery kierowc\u00F3w (oddzielone spacj\u0105), Enter = +1 okr\u0105\u017Cenie", disabled: !currentRace.isRunning, style: { flex: 1 } }), _jsx("button", { onClick: processBulkLap, disabled: !currentRace.isRunning, className: "btn btn-primary", children: "Wprowad\u017A" })] }), getSafeRiders(currentRace).length === 0 ? (_jsx("p", { className: "no-riders", children: "Brak kierowc\u00F3w. Przejd\u017A do Konfiguracji Wy\u015Bcigu aby doda\u0107 kierowc\u00F3w." })) : (_jsx("div", { className: "riders-by-class", children: (function () {
                                    var ridersByClass = {};
                                    getSafeRiders(currentRace).forEach(function (rider) {
                                        if (!ridersByClass[rider.class]) {
                                            ridersByClass[rider.class] = [];
                                        }
                                        ridersByClass[rider.class].push(rider);
                                    });
                                    return Object.keys(ridersByClass).map(function (className) {
                                        var classRiders = ridersByClass[className];
                                        return (_jsxs("div", { className: "class-group", children: [_jsxs("h3", { className: "class-group-title", children: ["Klasa ", className, " (", classRiders.length, ")"] }), _jsx("div", { className: "riders-grid", children: classRiders.map(function (rider) { return (_jsxs("div", { className: "rider-card ".concat(currentRace.isRunning ? 'clickable' : ''), onClick: function (e) { return currentRace.isRunning && handleRiderCardClick(rider.id, e); }, children: [_jsxs("div", { className: "rider-header", children: [_jsxs("span", { className: "rider-number", children: ["#", rider.number] }), _jsxs("span", { className: "rider-position", children: ["P", rider.position] })] }), _jsx("div", { className: "rider-name", children: rider.name }), _jsxs("div", { className: "rider-laps", children: ["Okr\u0105\u017Cenia: ", rider.laps] }), _jsxs("div", { className: "rider-total-time", children: ["\u0141\u0105czny czas: ", formatTotalTime(rider.totalTime)] }), _jsx("div", { className: "rider-actions", children: _jsx("button", { onClick: function (e) {
                                                                        e.stopPropagation();
                                                                        removeLap(rider.id);
                                                                    }, disabled: !currentRace.isRunning || rider.laps === 0, className: "btn btn-remove-lap", children: "-1 Okr\u0105\u017Cenie" }) })] }, rider.id)); }) })] }, className));
                                    });
                                })() }))] })) : (_jsxs("div", { className: "no-race-selected", children: [_jsx("h2", { children: "Brak wybranego wy\u015Bcigu" }), _jsx("p", { children: "Wybierz wy\u015Bcig z listy powy\u017Cej lub utw\u00F3rz nowy wy\u015Bcig w Konfiguracji Wy\u015Bcigu." })] })) })] }));
    };
    // Viewer Mode UI
    var renderViewerMode = function () {
        var currentRace = getCurrentRace();
        // Group riders by class
        var ridersByClass = {};
        if (currentRace) {
            getSafeRiders(currentRace).forEach(function (rider) {
                if (!ridersByClass[rider.class]) {
                    ridersByClass[rider.class] = [];
                }
                ridersByClass[rider.class].push(rider);
            });
        }
        return (_jsxs("div", { className: "viewer-app", children: [_jsxs("header", { className: "viewer-header", children: [_jsx("h1", { children: (currentRace === null || currentRace === void 0 ? void 0 : currentRace.name) || 'MxCounter Live Results' }), _jsxs("div", { className: "race-status", children: [_jsx(ConnectionStatus, {}), _jsx("span", { className: "status-indicator ".concat((currentRace === null || currentRace === void 0 ? void 0 : currentRace.isRunning) ? 'running' : 'stopped'), children: (currentRace === null || currentRace === void 0 ? void 0 : currentRace.isRunning) ? 'WYŚCIG W TOKU' : 'WYŚCIG ZATRZYMANY' })] })] }), _jsx("div", { className: "results-container", children: !currentRace || getSafeRiders(currentRace).length === 0 ? (_jsx("div", { className: "no-data", children: "Oczekiwanie na dane wy\u015Bcigu..." })) : (_jsx("div", { className: "class-results", children: Object.keys(ridersByClass).map(function (className) {
                            var classRiders = ridersByClass[className].sort(function (a, b) { return a.position - b.position; });
                            return (_jsxs("div", { className: "class-section", children: [_jsxs("h2", { className: "class-title", children: ["Klasa ", className] }), _jsxs("table", { className: "results-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "POZ" }), _jsx("th", { children: "NUMER" }), _jsx("th", { children: "IMI\u0118" }), _jsx("th", { children: "OKR\u0104\u017BENIA" }), _jsx("th", { children: "\u0141\u0104CZNY CZAS" }), _jsx("th", { children: "POPRZEDNIE OKR\u0104\u017BENIE" })] }) }), _jsx("tbody", { children: classRiders.map(function (rider) { return (_jsxs("tr", { className: "rider-row", children: [_jsx("td", { className: "position", style: { color: getPositionColor(rider.position) }, children: rider.position }), _jsxs("td", { className: "number", children: ["#", rider.number] }), _jsx("td", { className: "name", children: rider.name }), _jsx("td", { className: "laps", children: rider.laps }), _jsx("td", { className: "total-time", children: formatTotalTime(rider.totalTime) }), _jsx("td", { className: "last-lap", children: formatLapTime(rider.previousLapTime) })] }, rider.id)); }) })] })] }, className));
                        }) })) }), _jsx("footer", { className: "viewer-footer", children: _jsxs("div", { className: "race-info", children: [_jsxs("span", { children: ["\u0141\u0105cznie kierowc\u00F3w: ", getSafeRiders(currentRace).length] }), _jsxs("span", { children: ["Start wy\u015Bcigu: ", (currentRace === null || currentRace === void 0 ? void 0 : currentRace.startTime) ? formatTime(currentRace.startTime) : '--:--'] }), _jsxs("span", { children: ["Aktualne okr\u0105\u017Cenie: ", (currentRace === null || currentRace === void 0 ? void 0 : currentRace.currentLap) || 0] })] }) })] }));
    };
    // Race Setup UI
    var renderRaceSetup = function () {
        var currentRace = getCurrentRace();
        return (_jsxs("div", { className: "app", children: [_jsxs("header", { className: "header", children: [_jsx("h1", { children: "MxCounter - Konfiguracja Wy\u015Bcigu" }), _jsxs("div", { className: "header-controls", children: [_jsx(ConnectionStatus, {}), _jsx("button", { onClick: function () { return setShowRaceSetup(false); }, className: "btn btn-secondary", children: "Powr\u00F3t do Trybu Operatora" })] })] }), _jsxs("div", { className: "main-content race-setup-content", children: [_jsxs("div", { className: "setup-section", children: [_jsx("h2", { children: "Utw\u00F3rz Nowy Wy\u015Bcig" }), _jsxs("div", { className: "add-race-form", children: [_jsx("input", { type: "text", placeholder: "Nazwa wy\u015Bcigu", value: newRaceName, onChange: function (e) { return setNewRaceName(e.target.value); }, className: "input" }), _jsx("button", { onClick: createRace, className: "btn btn-primary", children: "Utw\u00F3rz Wy\u015Bcig" })] })] }), _jsxs("div", { className: "setup-section", children: [_jsx("h2", { children: "Klasy wy\u015Bcigu" }), _jsxs("div", { className: "add-race-form", children: [_jsx("input", { type: "text", placeholder: "Nazwa klasy (np. Junior, Cross, Quad)", value: newClassName, onChange: function (e) { return setNewClassName(e.target.value); }, className: "input" }), _jsx("button", { onClick: addClass, className: "btn btn-primary", children: "Dodaj klas\u0119" })] }), _jsx("div", { className: "races-list", children: ((currentRace === null || currentRace === void 0 ? void 0 : currentRace.classes) || []).length === 0 ? (_jsx("div", { className: "no-data", children: "Brak zdefiniowanych klas." })) : (((currentRace === null || currentRace === void 0 ? void 0 : currentRace.classes) || []).map(function (cls) { return (_jsxs("div", { className: "race-item", children: [_jsx("span", { className: "race-name", children: cls }), _jsx("div", { className: "race-actions", children: _jsx("button", { onClick: function () { return removeClass(cls); }, className: "btn btn-danger", children: "Usu\u0144" }) })] }, cls)); })) })] }), _jsxs("div", { className: "races-section", children: [_jsx("h2", { children: "Dost\u0119pne Wy\u015Bcigi" }), _jsx("div", { className: "races-list", children: (raceState.races || []).map(function (race) {
                                        var _a;
                                        return (_jsxs("div", { className: "race-item", children: [_jsx("span", { className: "race-name", children: race.name }), _jsxs("span", { className: "race-riders", children: ["(", ((_a = race.riders) === null || _a === void 0 ? void 0 : _a.length) || 0, " kierowc\u00F3w)"] }), _jsxs("div", { className: "race-actions", children: [_jsx("button", { onClick: function () { return selectRace(race.id); }, className: "btn ".concat(raceState.currentRaceId === race.id ? 'btn-primary' : 'btn-secondary'), children: raceState.currentRaceId === race.id ? 'Wybrany' : 'Wybierz' }), _jsx("button", { onClick: function () { return resetRace(); }, className: "btn btn-warning", disabled: !race.isRunning && getSafeRiders(race).length === 0, children: "Resetuj" }), _jsx("button", { onClick: function () { return removeRace(race.id); }, className: "btn btn-danger", children: "Usu\u0144" })] })] }, race.id));
                                    }) })] }), currentRace && (_jsxs("div", { className: "riders-setup-section", children: [_jsxs("h2", { children: ["Dodaj Kierowc\u00F3w do ", currentRace.name] }), _jsxs("div", { className: "add-rider-form", children: [_jsx("input", { type: "text", placeholder: "Numer kierowcy", value: newRiderNumber, onChange: function (e) { return setNewRiderNumber(e.target.value); }, className: "input" }), _jsx("input", { type: "text", placeholder: "Imi\u0119 kierowcy", value: newRiderName, onChange: function (e) { return setNewRiderName(e.target.value); }, className: "input" }), _jsxs("select", { value: newRiderClass, onChange: function (e) { return setNewRiderClass(e.target.value); }, className: "input", children: [_jsx("option", { value: "", children: "(bez klasy)" }), ((currentRace === null || currentRace === void 0 ? void 0 : currentRace.classes) || []).map(function (cls) { return (_jsx("option", { value: cls, children: cls }, cls)); })] }), _jsx("button", { onClick: addRider, className: "btn btn-primary", children: "Dodaj Kierowc\u0119" })] }), _jsx("div", { className: "riders-table", children: _jsxs("table", { className: "results-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "NUMER" }), _jsx("th", { children: "IMI\u0118" }), _jsx("th", { children: "KLASA" }), _jsx("th", { children: "AKCJE" })] }) }), _jsx("tbody", { children: getSafeRiders(currentRace).length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "no-data", children: "Brak dodanych kierowc\u00F3w." }) })) : (getSafeRiders(currentRace).map(function (rider) { return (_jsxs("tr", { className: "rider-row", children: [_jsxs("td", { className: "number", children: ["#", rider.number] }), _jsx("td", { className: "name", children: rider.name }), _jsx("td", { className: "class", children: rider.class }), _jsx("td", { className: "actions", children: _jsx("button", { onClick: function () { return removeRider(rider.id); }, className: "btn btn-remove", children: "Usu\u0144" }) })] }, rider.id)); })) })] }) })] }))] })] }));
    };
    // Debug output
    console.log('Current raceState:', raceState);
    console.log('Current race:', getCurrentRace());
    try {
        if (showRaceSetup) {
            return renderRaceSetup();
        }
        return isViewerMode ? renderViewerMode() : renderOperatorMode();
    }
    catch (error) {
        console.error('Error rendering app:', error);
        return (_jsxs("div", { className: "app", children: [_jsxs("header", { className: "header", children: [_jsx("h1", { children: "MxCounter" }), _jsx("p", { children: "B\u0142\u0105d \u0142adowania aplikacji" })] }), _jsx("div", { className: "main-content", children: _jsxs("div", { className: "setup-section", children: [_jsx("h2", { children: "B\u0142\u0105d" }), _jsx("p", { children: "Wyst\u0105pi\u0142 b\u0142\u0105d podczas \u0142adowania aplikacji. Od\u015Bwie\u017C stron\u0119." }), _jsx("pre", { children: error instanceof Error ? error.message : String(error) })] }) })] }));
    }
};
export default App;
