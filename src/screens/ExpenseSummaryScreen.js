import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { getExpensesApi, deleteExpenseApi } from '../api/expenses';
import { useAuth } from '../context/AuthContext';

const CHART_COLORS = [
  '#d8ff2f', '#8dc63f', '#37c7b5', '#6d8cff', '#ffb703',
  '#ff6b6b', '#7d5cff', '#00c2ff', '#87d45a', '#ffd84d',
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

function buildCategoryRows(chartData, total) {
  return [...chartData]
    .sort((left, right) => right.amount - left.amount)
    .map((item) => ({
      ...item,
      share: total > 0 ? (item.amount / total) * 100 : 0,
    }));
}

function formatCurrency(value) {
  return `₹${value.toFixed(2)}`;
}

function buildMonthlySeries(expenses, filterMode, selectedMonth, selectedYear) {
  const endDate =
    filterMode === 'month'
      ? new Date(Number(selectedYear), selectedMonth, 1)
      : filterMode === 'year'
        ? new Date(Number(selectedYear), 11, 1)
        : new Date();

  const buckets = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const bucketDate = new Date(endDate.getFullYear(), endDate.getMonth() - offset, 1);
    const key = `${bucketDate.getFullYear()}-${String(bucketDate.getMonth() + 1).padStart(2, '0')}`;
    const label = MONTHS[bucketDate.getMonth()].slice(0, 3);
    const amount = expenses.reduce((sum, expense) => {
      if (expense.date.slice(0, 7) !== key) {
        return sum;
      }
      return sum + expense.amount;
    }, 0);

    buckets.push({ key, label, amount: parseFloat(amount.toFixed(2)) });
  }

  const maxAmount = Math.max(...buckets.map((item) => item.amount), 1);
  return buckets.map((item) => ({
    ...item,
    heightRatio: item.amount / maxAmount,
  }));
}

const CATEGORY_ICONS = {
  'Food & Drink': 'silverware-fork-knife',
  Transport: 'car-outline',
  Shopping: 'bag-personal-outline',
  Entertainment: 'party-popper',
  Health: 'heart-pulse',
  'Bills & Utilities': 'lightning-bolt-outline',
  Education: 'school-outline',
  Travel: 'airplane',
  Other: 'shape-outline',
};

export default function ExpenseSummaryScreen() {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'month' | 'year'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      let period;
      if (filterMode === 'month') {
        const mm = String(selectedMonth + 1).padStart(2, '0');
        period = `${selectedYear}-${mm}`;
      } else if (filterMode === 'year') {
        period = selectedYear;
      }
      const data = await getExpensesApi(token, period ? { period } : {});
      setExpenses(data);
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setLoading(false);
    }
  }, [token, filterMode, selectedMonth, selectedYear]);

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
            await deleteExpenseApi(token, id);
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
  const categoryRows = buildCategoryRows(chartData, total);
  const monthlySeries = buildMonthlySeries(expenses, filterMode, selectedMonth, selectedYear);
  const averageSpend = expenses.length ? total / expenses.length : 0;
  const topCategory = categoryRows[0]?.name || 'None';
  const topCategoryAmount = categoryRows[0]?.amount || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Activity</Text>
          <Text style={styles.screenTitle}>Your spending dashboard</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#1b2338" />
        </TouchableOpacity>
      </View>

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

      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={styles.summaryLabel}>Total spending</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillText}>
              {filterMode === 'all' ? 'All' : filterMode === 'month' ? 'Month' : 'Year'}
            </Text>
          </View>
        </View>

        <View style={styles.barChartWrap}>
          <View style={styles.barChartScale}>
            <Text style={styles.barChartScaleText}>high</Text>
            <Text style={styles.barChartScaleText}>mid</Text>
            <Text style={styles.barChartScaleText}>low</Text>
          </View>
          <View style={styles.barChartColumns}>
            {monthlySeries.map((item, index) => (
              <View key={item.key} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.max(item.heightRatio * 100, item.amount > 0 ? 16 : 4)}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, styles.metricCardPrimary]}>
          <View style={styles.metricIconWrap}>
            <Ionicons name="trending-up" size={18} color="#1b2338" />
          </View>
          <Text style={styles.metricTitle}>Average spend</Text>
          <Text style={styles.metricValue}>{formatCurrency(averageSpend)}</Text>
        </View>
        <View style={styles.metricCard}>
          <View style={styles.metricIconWrapMuted}>
            <MaterialCommunityIcons name="shape-outline" size={18} color="#7f8a6f" />
          </View>
          <Text style={styles.metricTitle}>Top category</Text>
          <Text style={styles.metricValueDark} numberOfLines={1}>{topCategory}</Text>
          <Text style={styles.metricCaption}>{formatCurrency(topCategoryAmount)}</Text>
        </View>
      </View>

      {chartData.length > 0 ? (
        <>
          <View style={styles.categoryGridSection}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <Text style={styles.sectionAction}>Expense</Text>
            </View>
            <View style={styles.categoryCardsGrid}>
              {categoryRows.slice(0, 4).map((item) => (
                <View key={item.name} style={styles.categoryCard}>
                  <View style={[styles.categoryCardIcon, { backgroundColor: `${item.color}22` }]}>
                    <MaterialCommunityIcons
                      name={CATEGORY_ICONS[item.name] || 'shape-outline'}
                      size={18}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.categoryCardTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.categoryCardAmount}>{formatCurrency(item.amount)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>Category breakdown</Text>
              <Text style={styles.sectionAction}>Table</Text>
            </View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cell, styles.cellCategorySummary, styles.headerText]}>Category</Text>
              <Text style={[styles.cell, styles.cellShare, styles.headerText]}>Share</Text>
              <Text style={[styles.cell, styles.cellAmount, styles.headerText]}>Amount</Text>
            </View>
            {categoryRows.map((item) => (
              <View key={item.name} style={styles.categoryBreakdownRow}>
                <View style={styles.categorySummaryMain}>
                  <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.cell, styles.cellCategorySummary]} numberOfLines={1}>{item.name}</Text>
                </View>
                <View style={styles.categoryShareWrap}>
                  <View style={styles.categoryShareTrack}>
                    <View
                      style={[
                        styles.categoryShareFill,
                        { width: `${Math.max(item.share, 4)}%`, backgroundColor: item.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryShareLabel}>{item.share.toFixed(1)}%</Text>
                </View>
                <Text style={[styles.cell, styles.cellAmount]}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        !loading && (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>No expenses for this period.</Text>
          </View>
        )
      )}

      {expenses.length > 0 && (
        <View style={styles.tableContainer}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Recent transfer</Text>
            <Text style={styles.sectionAction}>Today</Text>
          </View>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cell, styles.cellDate, styles.headerText]}>Date</Text>
            <Text style={[styles.cell, styles.cellTitle, styles.headerText]}>Title</Text>
            <Text style={[styles.cell, styles.cellCategory, styles.headerText]}>Category</Text>
            <Text style={[styles.cell, styles.cellAmount, styles.headerText]}>Amount</Text>
            <Text style={[styles.cell, styles.cellAction, styles.headerText]}> </Text>
          </View>
          {expenses.map((exp) => (
            <View key={exp.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.cellDate]} numberOfLines={1}>{exp.date}</Text>
              <Text style={[styles.cell, styles.cellTitle]} numberOfLines={1}>{exp.title}</Text>
              <Text style={[styles.cell, styles.cellCategory]} numberOfLines={1}>{exp.category}</Text>
              <Text style={[styles.cell, styles.cellAmount]}>{formatCurrency(exp.amount)}</Text>
              <TouchableOpacity
                style={[styles.cell, styles.cellAction, styles.deleteAction]}
                onPress={() => handleDelete(exp.id)}
              >
                <Ionicons name="trash-outline" size={15} color="#1b2338" />
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
    backgroundColor: '#eef2e2',
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 15,
    color: '#6d765e',
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '600',
    color: '#182214',
    maxWidth: 240,
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8faef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#f8faef',
    borderRadius: 20,
    padding: 4,
    marginBottom: 14,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  filterBtnActive: {
    backgroundColor: '#d8ff2f',
  },
  filterText: {
    color: '#6a745b',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#1b2338',
  },
  pickerSection: {
    backgroundColor: '#f8faef',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1b2338',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  pickerLabel: {
    fontWeight: '600',
    color: '#68715b',
    marginBottom: 6,
    marginTop: 4,
  },
  chipScroll: {
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#eef2e2',
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: '#1b2338',
  },
  chipText: {
    color: '#536048',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#f8faef',
  },
  applyBtn: {
    backgroundColor: '#d8ff2f',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  applyBtnText: {
    color: '#1b2338',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#1b2338',
    borderRadius: 26,
    padding: 20,
    marginBottom: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  summaryLabel: {
    color: 'rgba(248,250,239,0.72)',
    fontSize: 13,
  },
  summaryAmount: {
    color: '#f8faef',
    fontSize: 34,
    fontWeight: '700',
    marginTop: 2,
  },
  summaryPill: {
    backgroundColor: '#d8ff2f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  summaryPillText: {
    color: '#1b2338',
    fontSize: 13,
    fontWeight: '700',
  },
  barChartWrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 172,
  },
  barChartScale: {
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginRight: 14,
  },
  barChartScaleText: {
    fontSize: 11,
    color: 'rgba(248,250,239,0.45)',
    textTransform: 'uppercase',
  },
  barChartColumns: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 18,
    height: 128,
    borderRadius: 999,
    backgroundColor: 'rgba(248,250,239,0.12)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    width: '100%',
    borderRadius: 999,
    minHeight: 6,
  },
  barLabel: {
    color: '#f8faef',
    fontSize: 11,
    opacity: 0.8,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#f8faef',
    borderRadius: 24,
    marginBottom: 16,
  },
  emptyText: {
    color: '#7a826d',
    fontSize: 15,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8faef',
    borderRadius: 22,
    padding: 16,
  },
  metricCardPrimary: {
    backgroundColor: '#d8ff2f',
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(27,35,56,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricIconWrapMuted: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#eef2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricTitle: {
    color: '#6f785f',
    fontSize: 13,
    marginBottom: 4,
  },
  metricValue: {
    color: '#1b2338',
    fontSize: 20,
    fontWeight: '700',
  },
  metricValueDark: {
    color: '#1b2338',
    fontSize: 18,
    fontWeight: '700',
  },
  metricCaption: {
    color: '#6f785f',
    fontSize: 12,
    marginTop: 4,
  },
  categoryGridSection: {
    backgroundColor: '#f8faef',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  categoryCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#eef2e2',
    borderRadius: 20,
    padding: 14,
  },
  categoryCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryCardTitle: {
    fontSize: 13,
    color: '#6c755c',
    marginBottom: 4,
  },
  categoryCardAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1b2338',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1b2338',
  },
  sectionAction: {
    fontSize: 13,
    color: '#6b755d',
  },
  tableContainer: {
    backgroundColor: '#f8faef',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#1b2338',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    marginBottom: 14,
    elevation: 4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0df',
    paddingVertical: 10,
  },
  tableHeader: {
    borderBottomColor: '#d9dfc6',
  },
  headerText: {
    fontWeight: '700',
    color: '#667159',
    fontSize: 12,
  },
  cell: {
    fontSize: 12,
    color: '#1b2338',
    paddingHorizontal: 2,
  },
  cellDate: { width: 72 },
  cellTitle: { flex: 1.2 },
  cellCategory: { flex: 1.5 },
  cellCategorySummary: { flex: 1.4 },
  cellShare: { width: 112, textAlign: 'left' },
  cellAmount: { width: 72, textAlign: 'right' },
  cellAction: { width: 32, alignItems: 'center', justifyContent: 'center' },
  categoryBreakdownRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0df',
    paddingVertical: 10,
    gap: 8,
  },
  categorySummaryMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 8,
  },
  categoryShareWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryShareTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#e2e8d0',
    overflow: 'hidden',
    marginRight: 8,
  },
  categoryShareFill: {
    height: '100%',
    borderRadius: 999,
  },
  categoryShareLabel: {
    width: 48,
    textAlign: 'right',
    color: '#6d765e',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteAction: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eef2e2',
  },
});
