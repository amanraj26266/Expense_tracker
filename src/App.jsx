import { useState } from 'react';
import { TransactionProvider } from './context/TransactionContext';
import Balance from './components/Balance';
import AddTransaction from './components/AddTransaction';
import TransactionList from './components/TransactionList';
import Charts from './components/Charts';
import './App.css';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <TransactionProvider>
        <header className="app-header">
          <div className="header-content">
            <div className="header-title">
              <span className="header-logo">💰</span>
              <div>
                <h1 className="app-title">Expense Tracker</h1>
                <p className="app-subtitle">Track your income & expenses</p>
              </div>
            </div>
            <button
              className="dark-toggle"
              onClick={() => setDarkMode((d) => !d)}
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <main className="app-main">
          <div className="left-panel">
            <Balance />
            <AddTransaction />
          </div>
          <div className="right-panel">
            <Charts />
            <TransactionList />
          </div>
        </main>
      </TransactionProvider>
    </div>
  );
}
