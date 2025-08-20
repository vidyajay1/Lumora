import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ChallengeScreen from './src/screens/ChallengeScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Services
import { initializeAIChallenges } from './src/services/aiService';
import { loadUserData, saveUserData } from './src/services/storageService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Ignore specific warnings for production
LogBox.ignoreLogs(['Warning:']);

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Challenges') {
            iconName = 'emoji-events';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Challenges" component={ChallengeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load user data from storage
      const savedData = await loadUserData();
      
      if (savedData) {
        setUserData(savedData);
      } else {
        // Initialize new user
        const newUserData = {
          id: Date.now().toString(),
          name: 'User',
          joinDate: new Date().toISOString(),
          completedChallenges: [],
          currentStreak: 0,
          totalChallenges: 0,
          preferences: {
            difficulty: 'medium',
            categories: ['personal', 'health', 'learning']
          }
        };
        setUserData(newUserData);
        await saveUserData(newUserData);
      }

      // Initialize AI challenges for the day
      await initializeAIChallenges();
      
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // You can add a splash screen here
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
