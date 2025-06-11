import { Tabs } from 'expo-router';
import { Calendar, Focus, Clock, Settings, BookOpen, Chrome as Home } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const [isInFocusMode, setIsInFocusMode] = useState(false);

  useEffect(() => {
    // Listen for focus mode changes
    const checkFocusMode = async () => {
      try {
        const focusMode = await AsyncStorage.getItem('isInFocusMode');
        setIsInFocusMode(focusMode === 'true');
      } catch (error) {
        console.error('Error checking focus mode:', error);
      }
    };

    // Check initially
    checkFocusMode();

    // Set up interval to check for changes
    const interval = setInterval(checkFocusMode, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2A1810',
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
          // Hide tab bar when in focus mode
          display: isInFocusMode ? 'none' : 'flex',
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#8B7355',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          tabBarIcon: ({ size, color }) => (
            <Focus size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weekly"
        options={{
          title: 'Weekly',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: 'Reflect',
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-block"
        options={{
          href: null, // This hides the tab from the tab bar
        }}
      />
    </Tabs>
  );
}