import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { registerCompanyApi } from '../api/auth';
import { API_BASE_URL } from '../config/api';

const TEST_ACCOUNTS = [
  { label: 'Aman Technologies', email: 'aman@gmail.com', password: 'aman123' },
  { label: 'Zen Logistics', email: 'admin@zen.com', password: 'aman123' },
];

function Field({ label, value, onChange, placeholder, secureTextEntry, keyboardType }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        keyboardType={keyboardType || 'default'}
        placeholder={placeholder}
        placeholderTextColor="#808a70"
        secureTextEntry={secureTextEntry}
      />
    </>
  );
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);

  // Login fields
  const [email, setEmail] = useState('aman@gmail.com');
  const [password, setPassword] = useState('aman123');

  // Register fields
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  function switchMode(next) {
    setMode(next);
    setLoading(false);
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Validation', 'Enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert('Login failed', `${error.message}\n\nAPI: ${API_BASE_URL}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!companyName.trim() || !adminName.trim() || !regEmail.trim() || !regPassword) {
      Alert.alert('Validation', 'Please fill in all fields');
      return;
    }
    if (regPassword !== regConfirm) {
      Alert.alert('Validation', 'Passwords do not match');
      return;
    }
    if (regPassword.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const payload = await registerCompanyApi({
        companyName: companyName.trim(),
        adminName: adminName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });
      // Auto-login after registration using returned token
      await login(regEmail.trim(), regPassword);
    } catch (error) {
      Alert.alert('Registration failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Mode toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'login' && styles.toggleBtnActive]}
            onPress={() => switchMode('login')}
          >
            <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'register' && styles.toggleBtnActive]}
            onPress={() => switchMode('register')}
          >
            <Text style={[styles.toggleText, mode === 'register' && styles.toggleTextActive]}>Add company</Text>
          </TouchableOpacity>
        </View>

        {mode === 'login' ? (
          <View style={styles.card}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>Sign in to your company account</Text>

            <Field label="Email" value={email} onChange={setEmail} placeholder="name@company.com" keyboardType="email-address" />
            <Field label="Password" value={password} onChange={setPassword} placeholder="Password" secureTextEntry />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Quick fill — test companies</Text>
            {TEST_ACCOUNTS.map((item) => (
              <TouchableOpacity
                key={item.email}
                style={styles.testChip}
                onPress={() => { setEmail(item.email); setPassword(item.password); }}
              >
                <Text style={styles.testChipTitle}>{item.label}</Text>
                <Text style={styles.testChipSub}>{item.email} · {item.password}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.heading}>New company</Text>
            <Text style={styles.subheading}>Register your organisation and create an admin account</Text>

            <Field label="Company name" value={companyName} onChange={setCompanyName} placeholder="Acme Corp" />
            <Field label="Your name" value={adminName} onChange={setAdminName} placeholder="Full name" />
            <Field label="Admin email" value={regEmail} onChange={setRegEmail} placeholder="you@company.com" keyboardType="email-address" />
            <Field label="Password" value={regPassword} onChange={setRegPassword} placeholder="Min 6 characters" secureTextEntry />
            <Field label="Confirm password" value={regConfirm} onChange={setRegConfirm} placeholder="Repeat password" secureTextEntry />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create company'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => switchMode('login')} style={styles.switchLink}>
              <Text style={styles.switchLinkText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2e2',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
    paddingTop: 40,
    paddingBottom: 40,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f8faef',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 18,
  },
  toggleBtnActive: {
    backgroundColor: '#1b2338',
  },
  toggleText: {
    color: '#6a745b',
    fontWeight: '600',
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#d8ff2f',
  },
  card: {
    backgroundColor: '#f8faef',
    borderRadius: 24,
    padding: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1b2338',
  },
  subheading: {
    marginTop: 4,
    marginBottom: 16,
    color: '#6a745b',
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    color: '#6a745b',
    marginBottom: 6,
    marginTop: 10,
    fontWeight: '600',
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbe3c8',
    backgroundColor: '#eef2e2',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1b2338',
    fontSize: 15,
  },
  button: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: '#d8ff2f',
    alignItems: 'center',
    paddingVertical: 13,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#1b2338',
    fontWeight: '700',
    fontSize: 16,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    color: '#6a745b',
    fontWeight: '600',
    fontSize: 13,
  },
  testChip: {
    backgroundColor: '#eef2e2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe3c8',
    padding: 10,
    marginBottom: 8,
  },
  testChipTitle: {
    color: '#1b2338',
    fontWeight: '700',
  },
  testChipSub: {
    color: '#6a745b',
    marginTop: 2,
    fontSize: 12,
  },
  switchLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchLinkText: {
    color: '#6a745b',
    fontSize: 13,
  },
});
