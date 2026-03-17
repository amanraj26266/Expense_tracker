export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: 'restaurant', color: '#FF6B6B' },
  { id: 'transport', label: 'Transport', icon: 'car', color: '#4ECDC4' },
  { id: 'shopping', label: 'Shopping', icon: 'cart', color: '#45B7D1' },
  { id: 'entertainment', label: 'Entertainment', icon: 'film', color: '#96CEB4' },
  { id: 'health', label: 'Health', icon: 'medkit', color: '#88D8B0' },
  { id: 'utilities', label: 'Utilities', icon: 'flash', color: '#FFEAA7' },
  { id: 'education', label: 'Education', icon: 'school', color: '#DDA0DD' },
  { id: 'travel', label: 'Travel', icon: 'airplane', color: '#87CEEB' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#B0B0B0' },
];

export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export const COLORS = {
  primary: '#6C63FF',
  secondary: '#FF6584',
  background: '#F8F9FA',
  card: '#FFFFFF',
  white: '#FFFFFF',
  text: '#1A1A2E',
  textLight: '#8E8E93',
  border: '#E5E5EA',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
};

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getMonthName(monthKey) {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
