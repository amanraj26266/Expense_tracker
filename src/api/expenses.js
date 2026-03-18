import { apiRequest } from './http';

function normalizeExpense(expense) {
  return {
    id: expense._id,
    title: expense.title,
    amount: Number(expense.amount),
    category: expense.category,
    note: expense.note || '',
    date: String(expense.date).slice(0, 10),
    userId: expense.userId,
    companyId: expense.companyId,
  };
}

export async function createExpenseApi(token, input) {
  const payload = await apiRequest('/api/expenses', {
    method: 'POST',
    token,
    body: input,
  });
  return normalizeExpense(payload.expense);
}

export async function getExpensesApi(token, { period, userId } = {}) {
  const params = new URLSearchParams();
  if (period) {
    params.set('period', period);
  }
  if (userId) {
    params.set('userId', userId);
  }

  const payload = await apiRequest(`/api/expenses${params.size ? `?${params.toString()}` : ''}`, {
    token,
  });

  return (payload.expenses || []).map(normalizeExpense);
}

export async function deleteExpenseApi(token, id) {
  return apiRequest(`/api/expenses/${id}`, {
    method: 'DELETE',
    token,
  });
}
