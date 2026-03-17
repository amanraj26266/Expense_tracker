# 💰 Expense Tracker

An advanced expense tracker built with **React + Vite** that showcases how client requirements are adapted during the development phase.

## Features

- **Dashboard Summary** — Real-time balance, total income, and total expenses
- **Add / Edit / Delete Transactions** — Income and expense entries with description, amount, category, and date
- **Category Support** — Predefined categories for both income (Salary, Freelance, Investment…) and expenses (Food, Housing, Transport…)
- **Charts** — Doughnut chart for expenses by category; bar chart for monthly income vs expenses
- **Search & Filter** — Filter transactions by keyword, type (income/expense), and category
- **Dark Mode** — Toggle between light and dark themes
- **Persistence** — All data is saved to `localStorage` so it survives page refreshes

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8 |
| Charts | Chart.js, react-chartjs-2 |
| State | React Context + useReducer |
| Storage | localStorage |
| Styling | CSS Modules (custom, no framework) |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/
│   ├── AddTransaction.jsx   # Add / edit transaction form
│   ├── Balance.jsx          # Summary cards (balance, income, expense)
│   ├── Charts.jsx           # Doughnut + bar charts
│   └── TransactionList.jsx  # Filterable transaction history
├── context/
│   └── TransactionContext.jsx  # Global state (Context + useReducer)
└── App.jsx                  # Root layout + dark mode toggle
```
