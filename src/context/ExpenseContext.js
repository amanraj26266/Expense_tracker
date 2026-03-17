import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExpenseContext = createContext();

const STORAGE_KEY = '@expense_tracker_data';

const initialState = {
  expenses: [],
  loading: true,
};

function expenseReducer(state, action) {
  switch (action.type) {
    case 'LOAD_EXPENSES':
      return { ...state, expenses: action.payload, loading: false };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    default:
      return state;
  }
}

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    if (!state.loading) {
      saveExpenses(state.expenses);
    }
  }, [state.expenses, state.loading]);

  async function loadExpenses() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const expenses = data ? JSON.parse(data) : [];
      dispatch({ type: 'LOAD_EXPENSES', payload: expenses });
    } catch (error) {
      console.error('Failed to load expenses:', error);
      dispatch({ type: 'LOAD_EXPENSES', payload: [] });
    }
  }

  async function saveExpenses(expenses) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Failed to save expenses:', error);
    }
  }

  function addExpense(expense) {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  }

  function deleteExpense(id) {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  }

  function updateExpense(expense) {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  }

  function getTotalExpenses() {
    return state.expenses.reduce((total, e) => total + parseFloat(e.amount), 0);
  }

  function getExpensesByCategory() {
    const grouped = {};
    state.expenses.forEach((expense) => {
      if (!grouped[expense.category]) {
        grouped[expense.category] = 0;
      }
      grouped[expense.category] += parseFloat(expense.amount);
    });
    return grouped;
  }

  function getMonthlyExpenses() {
    const monthly = {};
    state.expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) {
        monthly[key] = 0;
      }
      monthly[key] += parseFloat(expense.amount);
    });
    return monthly;
  }

  function getCurrentMonthExpenses() {
    const now = new Date();
    return state.expenses.filter((expense) => {
      const date = new Date(expense.date);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
  }

  return (
    <ExpenseContext.Provider
      value={{
        expenses: state.expenses,
        loading: state.loading,
        addExpense,
        deleteExpense,
        updateExpense,
        getTotalExpenses,
        getExpensesByCategory,
        getMonthlyExpenses,
        getCurrentMonthExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
