var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var RaceDatabase = /** @class */ (function () {
    function RaceDatabase() {
        this.state = {
            races: [],
            currentRaceId: null
        };
        this.listeners = [];
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.connect();
    }
    RaceDatabase.prototype.connect = function () {
        var _this = this;
        try {
            // Connect to WebSocket server
            // Allow override via environment variable or use current hostname
            var hostname = window.MXCOUNTER_SERVER_HOST || window.location.hostname;
            var serverUrl = "ws://".concat(hostname, ":8765");
            console.log('Attempting to connect to WebSocket server:', serverUrl);
            this.ws = new WebSocket(serverUrl);
            this.ws.onopen = function () {
                console.log('Connected to race server');
                _this.reconnectAttempts = 0;
            };
            this.ws.onmessage = function (event) {
                try {
                    var message = JSON.parse(event.data);
                    if (message.type === 'state') {
                        _this.state = message.data;
                        _this.notifyListeners();
                    }
                }
                catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            this.ws.onclose = function () {
                console.log('Disconnected from race server');
                _this.attemptReconnect();
            };
            this.ws.onerror = function (error) {
                console.error('WebSocket error:', error);
            };
        }
        catch (error) {
            console.error('Failed to connect to WebSocket server:', error);
            this.attemptReconnect();
        }
    };
    RaceDatabase.prototype.attemptReconnect = function () {
        var _this = this;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log("Attempting to reconnect (".concat(this.reconnectAttempts, "/").concat(this.maxReconnectAttempts, ")..."));
            setTimeout(function () {
                _this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        }
        else {
            console.error('Max reconnection attempts reached. Running in offline mode.');
        }
    };
    RaceDatabase.prototype.sendMessage = function (message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
        else {
            console.warn('WebSocket not connected, message not sent:', message);
        }
    };
    // Get current state
    RaceDatabase.prototype.getState = function () {
        return __assign({}, this.state);
    };
    // Get current race
    RaceDatabase.prototype.getCurrentRace = function () {
        var _this = this;
        if (!this.state.currentRaceId)
            return null;
        return this.state.races.find(function (race) { return race.id === _this.state.currentRaceId; }) || null;
    };
    // Get current race state for backward compatibility
    RaceDatabase.prototype.getCurrentRaceState = function () {
        var currentRace = this.getCurrentRace();
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
    };
    // Create new race
    RaceDatabase.prototype.createRace = function (name) {
        this.sendMessage({
            type: 'createRace',
            name: name
        });
    };
    // Select race
    RaceDatabase.prototype.selectRace = function (raceId) {
        this.sendMessage({
            type: 'selectRace',
            raceId: raceId
        });
    };
    // Remove race
    RaceDatabase.prototype.removeRace = function (raceId) {
        this.sendMessage({
            type: 'removeRace',
            raceId: raceId
        });
    };
    // Sort riders
    RaceDatabase.prototype.sortRiders = function () {
        this.sendMessage({
            type: 'sortRiders'
        });
    };
    // Manage classes
    RaceDatabase.prototype.addClass = function (name) {
        this.sendMessage({ type: 'addClass', name: name });
    };
    RaceDatabase.prototype.removeClass = function (name) {
        this.sendMessage({ type: 'removeClass', name: name });
    };
    // Add rider
    RaceDatabase.prototype.addRider = function (number, name, riderClass) {
        if (riderClass === void 0) { riderClass = ''; }
        this.sendMessage({
            type: 'addRider',
            number: number,
            name: name,
            class: riderClass
        });
    };
    // Remove rider
    RaceDatabase.prototype.removeRider = function (id) {
        this.sendMessage({
            type: 'removeRider',
            riderId: id
        });
    };
    // Add lap for rider
    RaceDatabase.prototype.addLap = function (riderId) {
        this.sendMessage({
            type: 'addLap',
            riderId: riderId
        });
    };
    // Remove lap for rider
    RaceDatabase.prototype.removeLap = function (riderId) {
        this.sendMessage({
            type: 'removeLap',
            riderId: riderId
        });
    };
    // Start race
    RaceDatabase.prototype.startRace = function () {
        this.sendMessage({
            type: 'startRace'
        });
    };
    // Finish race
    RaceDatabase.prototype.finishRace = function () {
        this.sendMessage({
            type: 'finishRace'
        });
    };
    // Reset race
    RaceDatabase.prototype.resetRace = function () {
        this.sendMessage({
            type: 'resetRace'
        });
    };
    // Subscribe to state changes
    RaceDatabase.prototype.subscribe = function (listener) {
        var _this = this;
        this.listeners.push(listener);
        // Return unsubscribe function
        return function () {
            var index = _this.listeners.indexOf(listener);
            if (index > -1) {
                _this.listeners.splice(index, 1);
            }
        };
    };
    // Notify all listeners
    RaceDatabase.prototype.notifyListeners = function () {
        var _this = this;
        this.listeners.forEach(function (listener) { return listener(_this.getState()); });
    };
    // Disconnect from server
    RaceDatabase.prototype.disconnect = function () {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    };
    return RaceDatabase;
}());
// Create singleton instance
export var raceDatabase = new RaceDatabase();
