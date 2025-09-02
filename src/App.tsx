import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import OperatorScreen from './screens/OperatorScreen';
import ViewerScreen from './screens/ViewerScreen';
import SettingsScreen from './screens/SettingsScreen';
import RaceSetupScreen from './screens/RaceSetupScreen';
import ResultsScreen from './screens/ResultsScreen';

// Context
import { RaceProvider } from './context/RaceContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Operator') {
            iconName = focused ? 'flag-checkered' : 'flag-checkered';
          } else if (route.name === 'Viewer') {
            iconName = focused ? 'view-list' : 'view-list';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Operator" 
        component={OperatorScreen}
        options={{
          title: 'Race Control',
        }}
      />
      <Tab.Screen 
        name="Viewer" 
        component={ViewerScreen}
        options={{
          title: 'Live Results',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RaceProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen 
                name="RaceSetup" 
                component={RaceSetupScreen}
                options={{
                  headerShown: true,
                  title: 'Race Setup',
                  headerStyle: {
                    backgroundColor: '#2563eb',
                  },
                  headerTintColor: '#ffffff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              />
              <Stack.Screen 
                name="Results" 
                component={ResultsScreen}
                options={{
                  headerShown: true,
                  title: 'Race Results',
                  headerStyle: {
                    backgroundColor: '#2563eb',
                  },
                  headerTintColor: '#ffffff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </RaceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;


