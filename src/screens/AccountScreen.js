import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function AccountScreen() {
  const { user, company, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name || '-'}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || '-'}</Text>
        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{user?.role || '-'}</Text>
        <Text style={styles.label}>Company</Text>
        <Text style={styles.value}>{company?.name || '-'}</Text>

        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2e2', padding: 18 },
  card: { backgroundColor: '#f8faef', borderRadius: 20, padding: 18 },
  title: { fontSize: 28, fontWeight: '700', color: '#1b2338', marginBottom: 12 },
  label: { color: '#6a745b', marginTop: 6 },
  value: { color: '#1b2338', fontWeight: '600' },
  button: { marginTop: 20, backgroundColor: '#1b2338', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#f8faef', fontWeight: '700' },
});
