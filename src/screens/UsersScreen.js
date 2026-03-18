import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { createUserApi, getUsersApi } from '../api/users';
import { getExpensesApi } from '../api/expenses';

function formatCurrency(v) {
  return `₹${Number(v).toFixed(2)}`;
}

export default function UsersScreen() {
  const { token, isAdmin, user: me, company } = useAuth();
  const [users, setUsers] = useState([]);
  const [spendMap, setSpendMap] = useState({}); // userId -> { total, expenses }
  const [expandedId, setExpandedId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('aman123');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadData = useCallback(async () => {
    if (!token || !isAdmin) return;
    setDataLoading(true);
    try {
      const data = await getUsersApi(token);
      setUsers(data);

      // Fetch expenses for every user in parallel
      const results = await Promise.all(
        data.map(async (u) => {
          try {
            const exps = await getExpensesApi(token, { userId: u._id || u.id });
            return { id: u._id || u.id, expenses: exps };
          } catch {
            return { id: u._id || u.id, expenses: [] };
          }
        })
      );

      const map = {};
      results.forEach(({ id, expenses }) => {
        const total = expenses.reduce((s, e) => s + e.amount, 0);
        map[id] = { total, expenses };
      });
      setSpendMap(map);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setDataLoading(false);
    }
  }, [token, isAdmin]);

  useFocusEffect(
    useCallback(() => { loadData(); }, [loadData])
  );

  async function handleCreateUser() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Validation', 'Name, email and password are required');
      return;
    }
    setLoading(true);
    try {
      await createUserApi(token, { name: name.trim(), email: email.trim(), password, role });
      setName(''); setEmail(''); setPassword('aman123'); setRole('employee');
      setShowAddForm(false);
      await loadData();
      Alert.alert('Success', 'User created');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helper}>Only company admins can view this screen.</Text>
      </View>
    );
  }

  const companyTotal = Object.values(spendMap).reduce((s, d) => s + d.total, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Admin</Text>
          <Text style={styles.heading}>{company?.name || 'Company'}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddForm((v) => !v)}>
          <Ionicons name={showAddForm ? 'close' : 'person-add'} size={20} color="#1b2338" />
        </TouchableOpacity>
      </View>

      {/* Company total banner */}
      <View style={styles.totalBanner}>
        <View>
          <Text style={styles.totalLabel}>Total company spend</Text>
          <Text style={styles.totalAmount}>{formatCurrency(companyTotal)}</Text>
        </View>
        <View style={styles.totalMeta}>
          <MaterialCommunityIcons name="account-group" size={22} color="#d8ff2f" />
          <Text style={styles.totalMetaText}>{users.length} members</Text>
        </View>
      </View>

      {/* Add user form */}
      {showAddForm && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add employee</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor="#7b866a" />
          <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor="#7b866a" />
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#7b866a" secureTextEntry />
          <View style={styles.roleRow}>
            {['employee', 'company_admin'].map((v) => (
              <TouchableOpacity key={v} style={[styles.roleChip, role === v && styles.roleChipActive]} onPress={() => setRole(v)}>
                <Text style={[styles.roleText, role === v && styles.roleTextActive]}>{v === 'employee' ? 'Employee' : 'Admin'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreateUser} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Employee list with expenses */}
      <Text style={styles.sectionTitle}>Employees</Text>
      {dataLoading ? (
        <ActivityIndicator size="large" color="#1b2338" style={{ marginTop: 32 }} />
      ) : users.length === 0 ? (
        <Text style={styles.helper}>No users yet</Text>
      ) : (
        users.map((u) => {
          const uid = u._id || u.id;
          const spend = spendMap[uid] || { total: 0, expenses: [] };
          const isExpanded = expandedId === uid;
          const isMe = uid === (me?._id || me?.id);

          return (
            <View key={uid} style={styles.employeeCard}>
              <TouchableOpacity
                style={styles.employeeRow}
                onPress={() => setExpandedId(isExpanded ? null : uid)}
                activeOpacity={0.75}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>{u.name?.[0]?.toUpperCase() || '?'}</Text>
                </View>
                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{u.name}{isMe ? ' (you)' : ''}</Text>
                  <Text style={styles.employeeEmail}>{u.email}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{u.role === 'company_admin' ? 'Admin' : 'Employee'}</Text>
                  </View>
                </View>
                <View style={styles.employeeRight}>
                  <Text style={styles.employeeTotal}>{formatCurrency(spend.total)}</Text>
                  <Text style={styles.employeeCount}>{spend.expenses.length} expenses</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#7e876d"
                    style={{ marginTop: 4 }}
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expenseList}>
                  {spend.expenses.length === 0 ? (
                    <Text style={styles.helper}>No expenses recorded</Text>
                  ) : (
                    spend.expenses.map((exp) => (
                      <View key={exp.id} style={styles.expenseRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.expenseTitle}>{exp.title}</Text>
                          <Text style={styles.expenseMeta}>{exp.date} · {exp.category}</Text>
                        </View>
                        <Text style={styles.expenseAmount}>{formatCurrency(exp.amount)}</Text>
                      </View>
                    ))
                  )}
                  <View style={styles.subtotalRow}>
                    <Text style={styles.subtotalLabel}>Subtotal</Text>
                    <Text style={styles.subtotalValue}>{formatCurrency(spend.total)}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef2e2' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2e2' },
  content: { padding: 18, paddingTop: 22, paddingBottom: 120 },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  eyebrow: { fontSize: 14, color: '#6d765e', marginBottom: 2 },
  heading: { fontSize: 28, fontWeight: '700', color: '#1b2338' },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#d8ff2f', alignItems: 'center', justifyContent: 'center' },

  // Total banner
  totalBanner: {
    backgroundColor: '#1b2338', borderRadius: 24, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: { color: 'rgba(248,250,239,0.65)', fontSize: 13 },
  totalAmount: { color: '#d8ff2f', fontSize: 32, fontWeight: '700', marginTop: 2 },
  totalMeta: { alignItems: 'center', gap: 4 },
  totalMetaText: { color: 'rgba(248,250,239,0.8)', fontSize: 13 },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1b2338', marginBottom: 10 },

  // Add user form
  card: { backgroundColor: '#f8faef', borderRadius: 20, padding: 14, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1b2338', marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#dbe3c8', backgroundColor: '#eef2e2',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, color: '#1b2338',
  },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  roleChip: { borderRadius: 14, backgroundColor: '#eef2e2', borderWidth: 1, borderColor: '#dbe3c8', paddingHorizontal: 12, paddingVertical: 8 },
  roleChipActive: { backgroundColor: '#d8ff2f', borderColor: '#d8ff2f' },
  roleText: { color: '#6a745b', fontWeight: '600' },
  roleTextActive: { color: '#1b2338', fontWeight: '700' },
  button: { borderRadius: 14, backgroundColor: '#1b2338', alignItems: 'center', paddingVertical: 11 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#f8faef', fontWeight: '700' },

  // Employee cards
  employeeCard: {
    backgroundColor: '#f8faef', borderRadius: 20, marginBottom: 10,
    overflow: 'hidden',
  },
  employeeRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#1b2338',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarLetter: { color: '#d8ff2f', fontSize: 18, fontWeight: '700' },
  employeeInfo: { flex: 1 },
  employeeName: { color: '#1b2338', fontWeight: '700', fontSize: 15 },
  employeeEmail: { color: '#6a745b', fontSize: 12, marginTop: 1 },
  roleBadge: {
    marginTop: 4, alignSelf: 'flex-start',
    backgroundColor: '#eef2e2', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2,
  },
  roleBadgeText: { fontSize: 11, color: '#6a745b', fontWeight: '600' },
  employeeRight: { alignItems: 'flex-end' },
  employeeTotal: { color: '#1b2338', fontWeight: '700', fontSize: 16 },
  employeeCount: { color: '#6a745b', fontSize: 12 },

  // Expense drilldown
  expenseList: { borderTopWidth: 1, borderTopColor: '#e6ecd6', paddingHorizontal: 14, paddingBottom: 10 },
  expenseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eef2e2' },
  expenseTitle: { color: '#1b2338', fontWeight: '600', fontSize: 14 },
  expenseMeta: { color: '#6a745b', fontSize: 12, marginTop: 2 },
  expenseAmount: { color: '#1b2338', fontWeight: '700', fontSize: 14, marginLeft: 8 },
  subtotalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: 10, marginTop: 2,
  },
  subtotalLabel: { color: '#6a745b', fontWeight: '600' },
  subtotalValue: { color: '#1b2338', fontWeight: '700' },

  helper: { color: '#6a745b', fontSize: 14, textAlign: 'center', marginTop: 12 },
});
