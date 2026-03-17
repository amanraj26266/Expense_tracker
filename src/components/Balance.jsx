import { useTransactions } from '../context/useTransactions';
import './Balance.css';

export default function Balance() {
  const { balance, income, expense } = useTransactions();

  const fmt = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="balance-section">
      <div className="balance-card total">
        <p className="balance-label">Total Balance</p>
        <h2 className={`balance-amount ${balance >= 0 ? 'positive' : 'negative'}`}>
          {fmt(balance)}
        </h2>
      </div>
      <div className="balance-stats">
        <div className="balance-card income">
          <span className="balance-icon income-icon">↑</span>
          <div>
            <p className="balance-label">Income</p>
            <p className="stat-amount income-amount">{fmt(income)}</p>
          </div>
        </div>
        <div className="balance-card expense">
          <span className="balance-icon expense-icon">↓</span>
          <div>
            <p className="balance-label">Expenses</p>
            <p className="stat-amount expense-amount">{fmt(expense)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
