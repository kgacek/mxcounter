# 🏁 Motocross Lap Counter - React Native App

A professional, offline-first mobile application for managing lap counting at motocross events. Built with React Native and TypeScript, designed for race officials and spectators.

## ✨ Features

### 🎯 Core Functionality
- **Lap Counting**: Tap rider tiles to increment laps with haptic feedback
- **Real-time Positioning**: Automatic position calculation based on laps and crossing times
- **Undo System**: Long-press tiles or use undo button to correct mistakes
- **Race State Management**: Pre-race, live, paused, and finished states
- **Offline Operation**: Works completely offline with local data storage

### 🏃‍♂️ Operator View
- **Large Rider Grid**: Easy-to-tap tiles optimized for race conditions
- **Smart Reordering**: Riders move to end after each lap (last seen)
- **Race Controls**: Start, pause, resume, finish, and reset race
- **Live Statistics**: Current leader, average laps, race progress
- **Quick Actions**: Race setup and results access

### 📊 Viewer View
- **Live Results Table**: Real-time position updates
- **Multiple Sort Options**: By position, laps, or rider number
- **Auto-refresh**: Updates every 5 seconds with manual refresh
- **Responsive Design**: Optimized for mobile, tablet, and TV displays

### ⚙️ Settings & Configuration
- **Race Setup**: Configure race name, max laps, rider management
- **App Preferences**: Sound, vibration, screen wake, theme options
- **Rider Management**: Add, remove, activate/deactivate riders
- **Sample Data**: Generate test riders for setup and testing

### 🏆 Results & Analytics
- **Podium Display**: Top 3 riders with medals and statistics
- **Complete Results**: Full race results with timestamps
- **Race Summary**: Duration, participants, statistics
- **Export Options**: Share results via native sharing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mxcounter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies (macOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start Metro bundler**
   ```bash
   npm start
   ```

5. **Run on device/emulator**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

## 📱 App Structure

### Navigation
- **Operator Tab**: Main race control interface
- **Viewer Tab**: Live results for spectators
- **Settings Tab**: App configuration and race setup
- **Stack Navigation**: Race setup and results screens

### Core Components
- `RiderTile`: Individual rider display with tap/long-press handling
- `RaceControls`: Race state management buttons
- `RaceStats`: Live race statistics display
- `RaceContext`: Global state management

### Data Flow
1. **Storage**: AsyncStorage for offline persistence
2. **State Management**: React Context with custom hooks
3. **Race Logic**: Pure functions for calculations and updates
4. **UI Updates**: Real-time state synchronization

## 🎨 UI/UX Design

### Design Principles
- **Large Touch Targets**: Optimized for race conditions
- **High Contrast**: Clear visibility in outdoor environments
- **Minimal Clutter**: Focus on essential information
- **Responsive Layout**: Adapts to different screen sizes

### Color Scheme
- **Primary**: Blue (#2563eb) for main actions
- **Success**: Green (#10b981) for positive actions
- **Warning**: Orange (#f59e0b) for caution states
- **Danger**: Red (#ef4444) for destructive actions
- **Neutral**: Gray scale for text and borders

## 🔧 Configuration

### Race Settings
- **Race Name**: Customizable event identifier
- **Maximum Laps**: Configurable race length
- **Rider Limit**: Support for 10-50 riders
- **Auto-sort**: Automatic position updates

### App Preferences
- **Sound Effects**: Audio feedback for actions
- **Vibration**: Haptic feedback for lap counting
- **Screen Wake**: Keep device active during races
- **Theme**: Light, dark, or auto theme selection

## 📊 Data Management

### Storage
- **Local Persistence**: AsyncStorage for offline operation
- **Race State**: Complete race information and history
- **Settings**: User preferences and configuration
- **Actions History**: Undo/redo functionality support

### Import/Export
- **CSV Support**: Rider list import/export
- **Data Backup**: Race results and settings backup
- **Sharing**: Native sharing for results and statistics

## 🚨 Error Handling

### Graceful Degradation
- **Offline Mode**: Full functionality without internet
- **Data Recovery**: Automatic state restoration
- **Error Boundaries**: User-friendly error messages
- **Validation**: Input validation and error prevention

### Performance
- **Debounced Updates**: Prevents UI lag during rapid tapping
- **Efficient Rendering**: Optimized component updates
- **Memory Management**: Proper cleanup and state management

## 🔒 Security & Privacy

### Data Protection
- **Local Storage**: No cloud data transmission
- **User Control**: Full control over data and settings
- **No Tracking**: No analytics or user tracking
- **Privacy First**: All data stays on device

## 🧪 Testing

### Development Testing
```bash
# Run tests
npm test

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

### Manual Testing
- **Race Scenarios**: Test various race configurations
- **Edge Cases**: Handle unusual situations gracefully
- **Performance**: Test with maximum rider counts
- **Accessibility**: Ensure usability for all users

## 📱 Platform Support

### Android
- **Minimum**: API 21 (Android 5.0)
- **Target**: API 33 (Android 13)
- **Features**: Full native functionality

### iOS
- **Minimum**: iOS 12.0
- **Target**: iOS 16.0
- **Features**: Full native functionality

## 🚀 Deployment

### Build Commands
```bash
# Android Release
npm run build:android

# iOS Release
npm run build:ios
```

### Distribution
- **Google Play Store**: Android APK/AAB
- **App Store**: iOS IPA
- **Direct Distribution**: APK/IPA files

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow TypeScript and React Native best practices
2. **Testing**: Include tests for new functionality
3. **Documentation**: Update README and code comments
4. **Performance**: Ensure efficient implementations

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request with description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Native Community**: For the excellent framework
- **Motocross Community**: For feedback and testing
- **Open Source Contributors**: For various libraries and tools

## 📞 Support

### Issues & Questions
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this README and code comments
- **Community**: Join discussions and share experiences

### Contact
- **Email**: [support@mxcounter.app](mailto:support@mxcounter.app)
- **Website**: [mxcounter.app](https://mxcounter.app)
- **Social**: Follow for updates and announcements

---

**Built with ❤️ for the motocross community**


