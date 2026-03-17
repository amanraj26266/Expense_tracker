import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import ExpenseFormScreen from './src/screens/ExpenseFormScreen';
import ExpenseSummaryScreen from './src/screens/ExpenseSummaryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#6200ea',
          tabBarInactiveTintColor: '#888',
          headerStyle: { backgroundColor: '#6200ea' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Tab.Screen
          name="Add Expense"
          component={ExpenseFormScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>➕</Text>,
          }}
        />
        <Tab.Screen
          name="Summary"
          component={ExpenseSummaryScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
