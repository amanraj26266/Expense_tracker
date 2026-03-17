import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useExpenses } from '../context/ExpenseContext';
import {
  COLORS,
  formatCurrency,
  getCategoryById,
  getMonthName,
} from '../utils/constants';

const { width } = Dimensions.get('window');
const BAR_CHART_HEIGHT = 120;

export default function StatisticsScreen() {
  const { expenses, getExpensesByCategory, getMonthlyExpenses } = useExpenses();

  const expensesByCategory = getExpensesByCategory();
  const monthlyExpenses = getMonthlyExpenses();

  const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const avgExpense =
    expenses.length > 0 ? totalSpent / expenses.length : 0;

  // Last 6 months bar chart data
  const last6Months = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        key,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        amount: monthlyExpenses[key] || 0,
      });
    }
    return months;
  }, [monthlyExpenses]);

  const maxMonthlyAmount = Math.max(...last6Months.map((m) => m.amount), 1);

  // Category breakdown sorted
  const categoryBreakdown = useMemo(() => {
    return Object.entries(expensesByCategory)
      .map(([id, amount]) => ({
        ...getCategoryById(id),
        id,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expensesByCategory, totalSpent]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Statistics</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="wallet" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{formatCurrency(totalSpent)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="receipt" size={24} color={COLORS.secondary} />
            <Text style={styles.statValue}>{expenses.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color={COLORS.warning} />
            <Text style={styles.statValue}>{formatCurrency(avgExpense)}</Text>
            <Text style={styles.statLabel}>Avg. Expense</Text>
          </View>
        </View>

        {/* Monthly Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Spending (Last 6 Months)</Text>
          <View style={styles.barChart}>
            {last6Months.map((month) => {
              const barHeight =
                maxMonthlyAmount > 0
                  ? (month.amount / maxMonthlyAmount) * BAR_CHART_HEIGHT
                  : 0;
              return (
                <View key={month.key} style={styles.barColumn}>
                  <Text style={styles.barAmount}>
                    {month.amount > 0 ? `$${Math.round(month.amount)}` : ''}
                  </Text>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(barHeight, month.amount > 0 ? 4 : 0),
                          backgroundColor:
                            month.amount > 0 ? COLORS.primary : COLORS.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{month.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            {categoryBreakdown.map((cat) => (
              <View key={cat.id} style={styles.categoryRow}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: cat.color + '20' },
                  ]}
                >
                  <Ionicons name={cat.icon} size={20} color={cat.color} />
                </View>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{cat.label}</Text>
                    <View style={styles.categoryAmountRow}>
                      <Text style={styles.categoryAmount}>
                        {formatCurrency(cat.amount)}
                      </Text>
                      <Text style={styles.categoryPercent}>
                        {cat.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.min(cat.percentage, 100)}%`,
                          backgroundColor: cat.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {expenses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="stats-chart-outline"
              size={56}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add some expenses to see your statistics
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    height: BAR_CHART_HEIGHT + 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barAmount: {
    fontSize: 9,
    color: COLORS.textLight,
    marginBottom: 4,
    textAlign: 'center',
  },
  barWrapper: {
    width: '60%',
    height: BAR_CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 6,
    textAlign: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  categoryAmountRow: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryPercent: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
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
  },
});
