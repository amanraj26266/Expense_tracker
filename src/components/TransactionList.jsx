import { useState } from 'react';
import { useTransactions } from '../context/useTransactions';
import AddTransaction from './AddTransaction';
import './TransactionList.css';

const CATEGORY_ICONS = {
  Salary: '💼', Freelance: '💻', Investment: '📈', Gift: '🎁', 'Other Income': '💰',
  Food: '🍔', Housing: '🏠', Transport: '🚗', Entertainment: '🎬', Health: '💊',
  Shopping: '🛍️', Utilities: '💡', Education: '📚', Other: '📌',
};

export default function TransactionList() {
  const { transactions, deleteTransaction } = useTransactions();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editData, setEditData] = useState(null);

  const categories = [...new Set(transactions.map((t) => t.category))];

  const filtered = transactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    const matchCat = filterCategory === 'all' || t.category === filterCategory;
    return matchSearch && matchType && matchCat;
  });

  const fmt = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  if (editData) {
    return <AddTransaction editData={editData} onEditDone={() => setEditData(null)} />;
  }

  return (
    <div className="transaction-list-card">
      <h3 className="list-title">Transaction History</h3>

      <div className="filters">
        <input
          className="search-input"
          type="text"
          placeholder="🔍 Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-row">
          <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>No transactions found.</p>
        </div>
      ) : (
        <ul className="transaction-ul">
          {filtered.map((t) => (
            <li key={t.id} className={`transaction-item ${t.type}`}>
              <span className="category-icon">{CATEGORY_ICONS[t.category] || '📌'}</span>
              <div className="transaction-info">
                <span className="transaction-desc">{t.description}</span>
                <span className="transaction-meta">
                  {t.category} &bull; {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <span className={`transaction-amount ${t.type}`}>
                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
              </span>
              <div className="transaction-actions">
                <button className="btn-edit" title="Edit" onClick={() => setEditData(t)}>✏️</button>
                <button className="btn-delete" title="Delete" onClick={() => deleteTransaction(t.id)}>🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
