import { createContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line react-refresh/only-export-components
export const TransactionContext = createContext();

const initialState = {
  transactions: JSON.parse(localStorage.getItem('expense_tracker_transactions')) || [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case 'EDIT_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    default:
      return state;
  }
}

export function TransactionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    localStorage.setItem('expense_tracker_transactions', JSON.stringify(state.transactions));
  }, [state.transactions]);

  const addTransaction = (transaction) => {
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: { ...transaction, id: uuidv4() },
    });
  };

  const deleteTransaction = (id) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const editTransaction = (transaction) => {
    dispatch({ type: 'EDIT_TRANSACTION', payload: transaction });
  };

  const income = state.transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = state.transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = income - expense;

  return (
    <TransactionContext.Provider
      value={{
        transactions: state.transactions,
        addTransaction,
        deleteTransaction,
        editTransaction,
        income,
        expense,
        balance,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
