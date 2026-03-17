import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('expenses.db');

/**
 * Initialise the expenses table if it doesn't exist.
 */
export const initDB = () =>
  new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS expenses (
          id        INTEGER PRIMARY KEY AUTOINCREMENT,
          title     TEXT    NOT NULL,
          amount    REAL    NOT NULL,
          category  TEXT    NOT NULL,
          note      TEXT,
          date      TEXT    NOT NULL
        );`,
        [],
        () => resolve(),
        (_, err) => { reject(err); return false; },
      );
    });
  });

/**
 * Insert a new expense record.
 */
export const insertExpense = ({ title, amount, category, note, date }) =>
  new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO expenses (title, amount, category, note, date) VALUES (?, ?, ?, ?, ?);',
        [title, amount, category, note || '', date],
        (_, result) => resolve(result.insertId),
        (_, err) => { reject(err); return false; },
      );
    });
  });

/**
 * Fetch all expenses ordered by date descending.
 */
export const fetchExpenses = () =>
  new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM expenses ORDER BY date DESC;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, err) => { reject(err); return false; },
      );
    });
  });

/**
 * Fetch expenses filtered by month (YYYY-MM) or year (YYYY).
 */
export const fetchExpensesByPeriod = (period) =>
  new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM expenses WHERE strftime(?, date) = ? ORDER BY date DESC;",
        [period.length === 7 ? '%Y-%m' : '%Y', period],
        (_, { rows }) => resolve(rows._array),
        (_, err) => { reject(err); return false; },
      );
    });
  });

/**
 * Delete an expense by id.
 */
export const deleteExpense = (id) =>
  new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM expenses WHERE id = ?;',
        [id],
        () => resolve(),
        (_, err) => { reject(err); return false; },
      );
    });
  });
