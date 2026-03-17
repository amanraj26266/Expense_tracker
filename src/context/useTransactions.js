import { useContext } from 'react';
import { TransactionContext } from './TransactionContext';

export function useTransactions() {
  return useContext(TransactionContext);
}
