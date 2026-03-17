# Expense Tracker — React Native

A mobile expense tracker app built with **React Native** and **Expo**. This application is an advanced version of the expense tracker which showcases how to adapt to client changes during the development phase.

## Features

- **Dashboard** — Monthly & all-time spending summary with top categories and recent transactions
- **Add / Edit Expenses** — Record expenses with title, amount, category, date, and notes
- **Expense List** — Searchable, filterable list of all expenses (by time period and category)
- **Statistics** — Visual monthly bar chart and category breakdown with percentages
- **Data Persistence** — Expenses saved locally using AsyncStorage (no backend required)
- **Delete Expenses** — Swipe-to-delete or tap the trash icon on any expense

## Categories

Food & Dining, Transport, Shopping, Entertainment, Health, Utilities, Education, Travel, Other

## Tech Stack

| Tool | Purpose |
|------|---------|
| [React Native](https://reactnative.dev/) | Cross-platform mobile framework |
| [Expo](https://expo.dev/) | Development toolchain & build system |
| [React Navigation](https://reactnavigation.org/) | Tab and stack navigation |
| [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) | Local data persistence |
| [@expo/vector-icons](https://docs.expo.dev/guides/icons/) | Ionicons icon set |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Expo Go](https://expo.dev/go) app on your iOS or Android device (for physical device testing)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

Then scan the QR code with **Expo Go** (Android) or the Camera app (iOS).

### Running on Emulator

```bash
# Android emulator
npm run android

# iOS simulator (macOS only)
npm run ios
```

## Project Structure

```
Expense_tracker/
├── App.js                   # Root component with navigation setup
├── app.json                 # Expo configuration
├── babel.config.js          # Babel configuration
├── package.json             # Dependencies
└── src/
    ├── context/
    │   └── ExpenseContext.js  # Global state management (useReducer + AsyncStorage)
    ├── screens/
    │   ├── DashboardScreen.js   # Home screen with summary & recent transactions
    │   ├── AddExpenseScreen.js  # Form to add/edit expenses
    │   ├── ExpenseListScreen.js # Full expense list with search & filter
    │   └── StatisticsScreen.js  # Charts and category breakdown
    └── utils/
        └── constants.js         # Colors, categories, formatters
```   
