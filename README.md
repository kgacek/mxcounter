# MX Counter - Real-Time Motocross Lap Counter

A web-based real-time motocross lap counter application with operator and viewer modes, featuring live synchronization across multiple clients.

## Features

### 🏁 **Real-Time Race Management**
- **Operator Mode**: Create races, add riders, manage lap counting
- **Viewer Mode**: Live race results display for spectators
- **WebSocket Communication**: Real-time synchronization across all connected clients
- **Data Persistence**: Race data saved to JSON file, survives server restarts

### 🏍️ **Race Features**
- **Multiple Races**: Create and manage multiple races simultaneously
- **Rider Classes**: Support for Junior, Cross, and Quad classes
- **Manual Sorting**: Sort riders by position manually in operator mode
- **Lap Correction**: Remove laps with "-1 Lap" button for error correction
- **Race Controls**: Start, stop, and reset races

### 📱 **User Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Class-based Display**: Separate tables for each rider class in viewer mode
- **Prominent Rider Numbers**: Large, easy-to-read rider numbers
- **Live Updates**: Real-time position and lap count updates

## Architecture

### **Frontend**
- **React + TypeScript**: Modern web application
- **Webpack**: Module bundling and development server
- **CSS**: Custom styling with responsive design

### **Backend**
- **Node.js + Express**: Web server and API endpoints
- **WebSocket (ws)**: Real-time bidirectional communication
- **File System**: JSON-based data persistence

### **Communication**
- **WebSocket Protocol**: Real-time state synchronization
- **Client-Server Architecture**: Centralized state management
- **Event-driven Updates**: Automatic UI updates on state changes

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd mxcounter
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Build the Application
```bash
# Build the frontend
npm run build
```

### 4. Start the Server
```bash
# Start the server (from project root)
cd server
npm start
```

The application will be available at:
- **Viewer Mode**: http://localhost:3001
- **Operator Mode**: http://localhost:3001/operator
- **Network Access**: http://[your-ip]:3001

## Usage

### Operator Mode (`/operator`)
1. **Race Setup**: Click "Race Setup" to create races and add riders
2. **Create Race**: Enter race name and click "Create Race"
3. **Add Riders**: Select race, enter rider details (number, name, class), click "Add Rider"
4. **Select Race**: Choose the active race from the dropdown
5. **Start Race**: Click "Start" to begin lap counting
6. **Count Laps**: Click on rider cards to increment laps
7. **Sort Riders**: Click "Sort" to manually sort by position
8. **Stop Race**: Click "Stop" to end the race

### Viewer Mode (root URL)
- **Live Results**: View real-time race results
- **Class Separation**: Results grouped by rider class
- **Position Tracking**: Automatic position updates
- **Lap Times**: Previous lap duration display

## Deployment

### Local Network Deployment
The server is configured to bind to `0.0.0.0:3001`, making it accessible on your local network.

### Production Deployment
1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy server files**:
   - Copy `server/` directory
   - Copy `dist/` directory (built frontend)
   - Copy `package.json` and `package-lock.json`

3. **Install production dependencies**:
   ```bash
   npm install --production
   cd server
   npm install --production
   ```

4. **Start the server**:
   ```bash
   cd server
   npm start
   ```

### Environment Variables
- `PORT`: Server port (default: 3001)
- `HOST`: Server host (default: 0.0.0.0)

## File Structure

```
mxcounter/
├── src/                    # Frontend source code
│   ├── App.tsx            # Main React component
│   ├── App.css            # Styles
│   ├── index.tsx          # Entry point
│   └── shared/
│       └── database.ts    # WebSocket client
├── server/                # Backend server
│   ├── server.js          # Express + WebSocket server
│   ├── package.json       # Server dependencies
│   └── race_data.json     # Persistent race data
├── public/                # Static assets
├── dist/                  # Built frontend (generated)
├── package.json           # Frontend dependencies
├── webpack.config.js      # Webpack configuration
└── tsconfig.json          # TypeScript configuration
```

## API Endpoints

### WebSocket Messages
- `createRace`: Create a new race
- `selectRace`: Select active race
- `removeRace`: Delete a race
- `addRider`: Add rider to current race
- `removeRider`: Remove rider from current race
- `addLap`: Increment rider's lap count
- `removeLap`: Decrement rider's lap count
- `startRace`: Start the current race
- `stopRace`: Stop the current race
- `resetRace`: Reset current race data
- `sortRiders`: Sort riders by position

### HTTP Endpoints
- `GET /`: Serve viewer mode
- `GET /operator`: Serve operator mode
- `GET /api/save`: Manually save data
- `GET /api/data-file`: Get data file information

## Data Structure

### Race Object
```typescript
interface Race {
  id: string;
  name: string;
  isRunning: boolean;
  startTime: number | null;
  riders: Rider[];
}
```

### Rider Object
```typescript
interface Rider {
  id: string;
  number: string;
  name: string;
  class: 'Junior' | 'Cross' | 'Quad';
  laps: number;
  position: number;
  lastLapTime: number | null;
  previousLapTime: number | null;
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
