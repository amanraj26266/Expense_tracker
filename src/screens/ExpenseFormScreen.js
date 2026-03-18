import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createExpenseApi } from '../api/expenses';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { label: 'Food & Drink', icon: 'silverware-fork-knife' },
  { label: 'Transport', icon: 'car-outline' },
  { label: 'Shopping', icon: 'bag-personal-outline' },
  { label: 'Entertainment', icon: 'party-popper' },
  { label: 'Health', icon: 'heart-pulse' },
  { label: 'Bills & Utilities', icon: 'lightning-bolt-outline' },
  { label: 'Education', icon: 'school-outline' },
  { label: 'Travel', icon: 'airplane' },
  { label: 'Other', icon: 'shape-outline' },
];

const QUICK_AMOUNTS = [120, 250, 500, 1200];

function formatPreviewAmount(value) {
  const numericValue = parseFloat(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue.toFixed(2) : '0.00';
}

export default function ExpenseFormScreen() {
  const { token, company } = useAuth();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation', 'Please enter a valid amount.');
      return;
    }
    if (!category) {
      Alert.alert('Validation', 'Please select a category.');
      return;
    }
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Validation', 'Date must be in YYYY-MM-DD format.');
      return;
    }

    try {
      setSaving(true);
      await createExpenseApi(token, {
        title: title.trim(),
        amount: parsedAmount,
        category,
        note,
        date,
      });
      Alert.alert('Success', 'Expense added!');
      setTitle('');
      setAmount('');
      setCategory('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroHeader}>
        <View>
          <Text style={styles.eyebrow}>Hi, welcome back</Text>
          <Text style={styles.heroTitle}>Create a new expense card</Text>
          <Text style={styles.companyHint}>{company?.name || 'Company'}</Text>
        </View>
        <View style={styles.heroBadge}>
          <Ionicons name="sparkles" size={18} color="#1b2338" />
        </View>
      </View>

      <View style={styles.previewCard}>
        <View style={styles.previewCardTop}>
          <Text style={styles.previewBrand}>EXPENSE</Text>
          <TouchableOpacity style={styles.previewMenu}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#1b2338" />
          </TouchableOpacity>
        </View>
        <Text style={styles.previewAmount}>₹ {formatPreviewAmount(amount)}</Text>
        <View style={styles.previewMetaRow}>
          <View>
            <Text style={styles.previewMetaLabel}>Title</Text>
            <Text style={styles.previewMetaValue}>{title.trim() || 'New expense'}</Text>
          </View>
          <View>
            <Text style={styles.previewMetaLabel}>Date</Text>
            <Text style={styles.previewMetaValue}>{date}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick amount</Text>
        <View style={styles.quickAmountRow}>
          {QUICK_AMOUNTS.map((value) => (
            <TouchableOpacity
              key={value}
              style={styles.quickAmountChip}
              onPress={() => setAmount(String(value))}
            >
              <Text style={styles.quickAmountText}>₹ {value}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Card detail</Text>

        <Text style={styles.label}>Expense title</Text>
        <View style={styles.inputShell}>
          <MaterialCommunityIcons name="receipt-text-outline" size={18} color="#55604a" />
          <TextInput
            style={styles.input}
            placeholder="Lunch, fuel, groceries"
            placeholderTextColor="#8b957a"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <Text style={styles.label}>Amount</Text>
        <View style={styles.inputShell}>
          <MaterialCommunityIcons name="currency-inr" size={18} color="#55604a" />
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#8b957a"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={styles.label}>Date</Text>
        <View style={styles.inputShell}>
          <Ionicons name="calendar-outline" size={18} color="#55604a" />
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#8b957a"
            value={date}
            onChangeText={setDate}
          />
        </View>

        <Text style={styles.label}>Note</Text>
        <View style={[styles.inputShell, styles.noteShell]}>
          <MaterialCommunityIcons name="text-box-outline" size={18} color="#55604a" />
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Add context for this spend"
            placeholderTextColor="#8b957a"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Pick category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((item) => {
            const selected = category === item.label;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                onPress={() => setCategory(item.label)}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={18}
                  color={selected ? '#1b2338' : '#6a745b'}
                />
                <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#1b2338" /> : <Text style={styles.buttonText}>Save expense</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2e2',
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 120,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 15,
    color: '#5f6a53',
    marginBottom: 4,
  },
  companyHint: {
    marginTop: 4,
    color: '#6e795f',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 29,
    fontWeight: '600',
    color: '#161f12',
    maxWidth: 250,
  },
  heroBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#d8ff2f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    backgroundColor: '#c8f533',
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#a8c915',
    shadowOpacity: 0.25,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  previewCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  previewBrand: {
    fontSize: 15,
    fontWeight: '800',
    color: '#20403a',
    letterSpacing: 1,
  },
  previewMenu: {
    width: 42,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAmount: {
    fontSize: 31,
    fontWeight: '700',
    color: '#162112',
    marginBottom: 22,
  },
  previewMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewMetaLabel: {
    fontSize: 12,
    color: '#57634a',
    marginBottom: 4,
  },
  previewMetaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#182214',
  },
  sectionCard: {
    backgroundColor: '#f8faef',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#1b2338',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '600',
    color: '#1b2338',
    marginBottom: 12,
  },
  quickAmountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAmountChip: {
    backgroundColor: '#1b2338',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  quickAmountText: {
    color: '#f8faef',
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6a745b',
    marginBottom: 6,
    marginTop: 10,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2e2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbe3c8',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  noteShell: {
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#182214',
    marginLeft: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#eef2e2',
    borderWidth: 1,
    borderColor: '#dbe3c8',
  },
  categoryChipSelected: {
    backgroundColor: '#d8ff2f',
    borderColor: '#d8ff2f',
  },
  categoryText: {
    fontSize: 13,
    color: '#55604a',
    marginLeft: 8,
    flexShrink: 1,
  },
  categoryTextSelected: {
    color: '#1b2338',
    fontWeight: '600',
  },
  noteInput: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#f4ff38',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#cfd5bc',
  },
  buttonText: {
    color: '#1b2338',
    fontSize: 16,
    fontWeight: '700',
  },
});
