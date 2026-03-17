import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { initDB, insertExpense } from '../database/database';

const CATEGORIES = [
  'Food & Drink',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Bills & Utilities',
  'Education',
  'Travel',
  'Other',
];

export default function ExpenseFormScreen() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDB()
      .then(() => setDbReady(true))
      .catch((err) => Alert.alert('DB Error', String(err)));
  }, []);

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
      await insertExpense({ title: title.trim(), amount: parsedAmount, category, note, date });
      Alert.alert('Success', 'Expense added!');
      setTitle('');
      setAmount('');
      setCategory('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>New Expense</Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Lunch at café"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Amount (₹) *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 250"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
      />

      <Text style={styles.label}>Category *</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, category === cat && styles.categoryChipSelected]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryText, category === cat && styles.categoryTextSelected]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={[styles.input, styles.noteInput]}
        placeholder="Additional details…"
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.button, !dbReady && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!dbReady}
      >
        <Text style={styles.buttonText}>Save Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 20,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    color: '#222',
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e8e0f7',
    marginBottom: 4,
  },
  categoryChipSelected: {
    backgroundColor: '#6200ea',
  },
  categoryText: {
    fontSize: 13,
    color: '#6200ea',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6200ea',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
