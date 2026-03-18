import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import ExpenseFormScreen from './src/screens/ExpenseFormScreen';
import ExpenseSummaryScreen from './src/screens/ExpenseSummaryScreen';
import LoginScreen from './src/screens/LoginScreen';
import UsersScreen from './src/screens/UsersScreen';
import AccountScreen from './src/screens/AccountScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();

const theme = {
  dark: false,
  colors: {
    primary: '#1b2338',
    background: '#eef2e2',
    card: '#f8faef',
    text: '#1c2516',
    border: '#d6ddc3',
    notification: '#d8ff2f',
  },
};

function TabNavigator() {
  const { isAdmin } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1b2338',
        tabBarInactiveTintColor: '#7e876d',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: Math.max(insets.bottom, 12) + 6,
          height: 64,
          borderRadius: 28,
          backgroundColor: '#fbfdf4',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#1b2338',
          shadowOpacity: 0.15,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          paddingTop: 0,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          height: 64,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        sceneStyle: {
          backgroundColor: '#eef2e2',
        },
      }}
    >
      <Tab.Screen
        name="Add Expense"
        component={ExpenseFormScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'credit-card-plus' : 'credit-card-plus-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Summary"
        component={ExpenseSummaryScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'stats-chart' : 'stats-chart-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Users"
        component={UsersScreen}
        options={{
          tabBarButton: isAdmin ? undefined : () => null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2e2' }}>
        <ActivityIndicator size="large" color="#1b2338" />
      </View>
    );
  }

  if (!token) {
    return <LoginScreen />;
  }

  return <TabNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={theme}>
          <StatusBar style="dark" />
          <MainNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
