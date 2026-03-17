import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';

import { initDB, fetchExpenses, fetchExpensesByPeriod, deleteExpense } from '../database/database';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CHART_COLORS = [
  '#6200ea', '#03dac6', '#ff6d00', '#2979ff', '#d50000',
  '#00c853', '#aa00ff', '#ff6f00', '#0091ea', '#558b2f',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function buildYears() {
  const current = new Date().getFullYear();
  return [current - 2, current - 1, current, current + 1].map(String);
}

function groupByCategory(expenses) {
  return expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});
}

function buildChartData(categoryTotals) {
  return Object.entries(categoryTotals).map(([name, total], idx) => ({
    name,
    amount: parseFloat(total.toFixed(2)),
    color: CHART_COLORS[idx % CHART_COLORS.length],
    legendFontColor: '#333',
    legendFontSize: 13,
  }));
}

export default function ExpenseSummaryScreen() {
  const [expenses, setExpenses] = useState([]);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'month' | 'year'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      await initDB();
      let data;
      if (filterMode === 'month') {
        const mm = String(selectedMonth + 1).padStart(2, '0');
        data = await fetchExpensesByPeriod(`${selectedYear}-${mm}`);
      } else if (filterMode === 'year') {
        data = await fetchExpensesByPeriod(selectedYear);
      } else {
        data = await fetchExpenses();
      }
      setExpenses(data);
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setLoading(false);
    }
  }, [filterMode, selectedMonth, selectedYear]);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses]),
  );

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Remove this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpense(id);
            loadExpenses();
          } catch (err) {
            Alert.alert('Error', String(err));
          }
        },
      },
    ]);
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const categoryTotals = groupByCategory(expenses);
  const chartData = buildChartData(categoryTotals);

  return (
    <ScrollView style={styles.container}>
      {/* ─── Filter bar ─── */}
      <View style={styles.filterRow}>
        {['all', 'month', 'year'].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.filterBtn, filterMode === mode && styles.filterBtnActive]}
            onPress={() => setFilterMode(mode)}
          >
            <Text style={[styles.filterText, filterMode === mode && styles.filterTextActive]}>
              {mode === 'all' ? 'All' : mode === 'month' ? 'Month' : 'Year'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Month / Year pickers ─── */}
      {filterMode !== 'all' && (
        <View style={styles.pickerSection}>
          {/* Year selector */}
          <Text style={styles.pickerLabel}>Year</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {buildYears().map((yr) => (
              <TouchableOpacity
                key={yr}
                style={[styles.chip, selectedYear === yr && styles.chipActive]}
                onPress={() => setSelectedYear(yr)}
              >
                <Text style={[styles.chipText, selectedYear === yr && styles.chipTextActive]}>
                  {yr}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Month selector (only for month mode) */}
          {filterMode === 'month' && (
            <>
              <Text style={styles.pickerLabel}>Month</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {MONTHS.map((m, idx) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.chip, selectedMonth === idx && styles.chipActive]}
                    onPress={() => setSelectedMonth(idx)}
                  >
                    <Text style={[styles.chipText, selectedMonth === idx && styles.chipTextActive]}>
                      {m.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <TouchableOpacity style={styles.applyBtn} onPress={loadExpenses}>
            <Text style={styles.applyBtnText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Summary card ─── */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>
        <Text style={styles.summaryAmount}>₹ {total.toFixed(2)}</Text>
        <Text style={styles.summaryCount}>{expenses.length} transaction{expenses.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* ─── Pie chart ─── */}
      {chartData.length > 0 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <PieChart
            data={chartData}
            width={SCREEN_WIDTH - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(98, 0, 234, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      ) : (
        !loading && (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>No expenses for this period.</Text>
          </View>
        )
      )}

      {/* ─── Table ─── */}
      {expenses.length > 0 && (
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          {/* Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cell, styles.cellDate, styles.headerText]}>Date</Text>
            <Text style={[styles.cell, styles.cellTitle, styles.headerText]}>Title</Text>
            <Text style={[styles.cell, styles.cellCategory, styles.headerText]}>Category</Text>
            <Text style={[styles.cell, styles.cellAmount, styles.headerText]}>Amount</Text>
            <Text style={[styles.cell, styles.cellAction, styles.headerText]}> </Text>
          </View>
          {/* Rows */}
          {expenses.map((exp) => (
            <View key={exp.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.cellDate]} numberOfLines={1}>{exp.date}</Text>
              <Text style={[styles.cell, styles.cellTitle]} numberOfLines={1}>{exp.title}</Text>
              <Text style={[styles.cell, styles.cellCategory]} numberOfLines={1}>{exp.category}</Text>
              <Text style={[styles.cell, styles.cellAmount]}>₹{exp.amount.toFixed(2)}</Text>
              <TouchableOpacity
                style={[styles.cell, styles.cellAction]}
                onPress={() => handleDelete(exp.id)}
              >
                <Text style={styles.deleteBtn}>🗑</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  /* filter bar */
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#e8e0f7',
    borderRadius: 24,
    padding: 4,
    marginBottom: 12,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  filterBtnActive: {
    backgroundColor: '#6200ea',
  },
  filterText: {
    color: '#6200ea',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  /* pickers */
  pickerSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  pickerLabel: {
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 4,
  },
  chipScroll: {
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e8e0f7',
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: '#6200ea',
  },
  chipText: {
    color: '#6200ea',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  applyBtn: {
    backgroundColor: '#6200ea',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  /* summary card */
  summaryCard: {
    backgroundColor: '#6200ea',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
  },
  /* chart */
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: '#999',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  /* table */
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 8,
  },
  tableHeader: {
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: 12,
  },
  cell: {
    fontSize: 12,
    color: '#333',
    paddingHorizontal: 2,
  },
  cellDate: { width: 72 },
  cellTitle: { flex: 1.2 },
  cellCategory: { flex: 1.5 },
  cellAmount: { width: 72, textAlign: 'right' },
  cellAction: { width: 32, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: {
    fontSize: 16,
    textAlign: 'center',
  },
});
