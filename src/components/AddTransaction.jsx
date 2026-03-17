import { useState } from 'react';
import { useTransactions } from '../context/useTransactions';
import './AddTransaction.css';

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other Income'],
  expense: ['Food', 'Housing', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Education', 'Other'],
};

const defaultForm = {
  type: 'expense',
  description: '',
  amount: '',
  category: 'Food',
  date: new Date().toISOString().split('T')[0],
};

export default function AddTransaction({ editData, onEditDone }) {
  const { addTransaction, editTransaction } = useTransactions();
  const [form, setForm] = useState(editData || defaultForm);
  const [error, setError] = useState('');

  const isEditing = Boolean(editData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'type') {
        updated.category = CATEGORIES[value][0];
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return setError('Description is required.');
    if (!form.amount || Number(form.amount) <= 0) return setError('Enter a valid positive amount.');
    setError('');
    if (isEditing) {
      editTransaction({ ...form, amount: Number(form.amount) });
      onEditDone();
    } else {
      addTransaction({ ...form, amount: Number(form.amount) });
      setForm(defaultForm);
    }
  };

  return (
    <div className="add-transaction-card">
      <h3 className="form-title">{isEditing ? '✏️ Edit Transaction' : '+ Add Transaction'}</h3>
      {error && <p className="form-error">{error}</p>}
      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-row type-row">
          <label className={`type-btn ${form.type === 'income' ? 'active income-btn' : ''}`}>
            <input
              type="radio"
              name="type"
              value="income"
              checked={form.type === 'income'}
              onChange={handleChange}
            />
            ↑ Income
          </label>
          <label className={`type-btn ${form.type === 'expense' ? 'active expense-btn' : ''}`}>
            <input
              type="radio"
              name="type"
              value="expense"
              checked={form.type === 'expense'}
              onChange={handleChange}
            />
            ↓ Expense
          </label>
        </div>

        <div className="form-row">
          <label className="form-label">Description</label>
          <input
            className="form-input"
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="e.g. Grocery shopping"
            maxLength={60}
          />
        </div>

        <div className="form-row two-col">
          <div>
            <label className="form-label">Amount ($)</label>
            <input
              className="form-input"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0.01"
              step="0.01"
            />
          </div>
          <div>
            <label className="form-label">Date</label>
            <input
              className="form-input"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">Category</label>
          <select className="form-input" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES[form.type].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className={`btn-submit ${form.type === 'income' ? 'income-submit' : 'expense-submit'}`}>
            {isEditing ? 'Save Changes' : `Add ${form.type.charAt(0).toUpperCase() + form.type.slice(1)}`}
          </button>
          {isEditing && (
            <button type="button" className="btn-cancel" onClick={onEditDone}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
