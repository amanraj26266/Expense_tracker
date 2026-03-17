import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useExpenses } from '../context/ExpenseContext';
import { COLORS, CATEGORIES, formatCurrency, formatDate, getCategoryById } from '../utils/constants';

const FILTER_OPTIONS = ['All', 'This Month', 'Last Month', 'This Year'];

export default function ExpenseListScreen() {
  const navigation = useNavigation();
  const { expenses, deleteExpense } = useExpenses();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let filtered = expenses;

    // Apply time filter
    if (selectedFilter === 'This Month') {
      filtered = filtered.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (selectedFilter === 'Last Month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      filtered = filtered.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
      });
    } else if (selectedFilter === 'This Year') {
      filtered = filtered.filter((e) => new Date(e.date).getFullYear() === now.getFullYear());
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.notes?.toLowerCase().includes(q) ||
          getCategoryById(e.category).label.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [expenses, selectedFilter, selectedCategory, search]);

  const totalFiltered = filteredExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  );

  function confirmDelete(id) {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(id),
        },
      ]
    );
  }

  function renderExpenseItem({ item }) {
    const category = getCategoryById(item.category);
    return (
      <View style={styles.expenseCard}>
        <View
          style={[
            styles.expenseIcon,
            { backgroundColor: category.color + '20' },
          ]}
        >
          <Ionicons name={category.icon} size={22} color={category.color} />
        </View>
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.expenseCategory}>{category.label}</Text>
          <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
          {item.notes ? (
            <Text style={styles.expenseNotes} numberOfLines={1}>
              {item.notes}
            </Text>
          ) : null}
        </View>
        <View style={styles.expenseActions}>
          <Text style={styles.expenseAmount}>-{formatCurrency(item.amount)}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('AddExpense', { expense: item })
              }
              style={styles.editBtn}
            >
              <Ionicons name="pencil" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmDelete(item.id)}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash" size={16} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Expenses</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search expenses..."
          placeholderTextColor={COLORS.textLight}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Time Filters */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              selectedFilter === f && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter(f)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === f && styles.filterChipTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilterRow}>
        <TouchableOpacity
          style={[
            styles.catChip,
            selectedCategory === 'all' && styles.catChipActive,
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.catChipText,
              selectedCategory === 'all' && styles.catChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.catChip,
              selectedCategory === cat.id && {
                backgroundColor: cat.color + '20',
                borderColor: cat.color,
              },
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon}
              size={14}
              color={
                selectedCategory === cat.id ? cat.color : COLORS.textLight
              }
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      {filteredExpenses.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalFiltered)}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenseItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={56} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No expenses found</Text>
            <Text style={styles.emptySubtitle}>
              {expenses.length === 0
                ? 'Add your first expense to get started'
                : 'Try adjusting your filters'}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  categoryFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 8,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catChipActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  catChipText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  catChipTextActive: {
    color: COLORS.primary,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  summaryAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  expenseCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    alignItems: 'center',
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  expenseCategory: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 1,
  },
  expenseDate: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  expenseNotes: {
    fontSize: 11,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 2,
  },
  expenseActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 80,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    padding: 4,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
