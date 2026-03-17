import * as SQLite from 'expo-sqlite';

const dbPromise = SQLite.openDatabaseAsync('expenses.db');

const getDB = async () => dbPromise;

/**
 * Initialise the expenses table if it doesn't exist.
 */
export const initDB = async () => {
  const db = await getDB();
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS expenses (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      title     TEXT    NOT NULL,
      amount    REAL    NOT NULL,
      category  TEXT    NOT NULL,
      note      TEXT,
      date      TEXT    NOT NULL
    );`,
  );
};

/**
 * Insert a new expense record.
 */
export const insertExpense = async ({ title, amount, category, note, date }) => {
  const db = await getDB();
  const result = await db.runAsync(
    'INSERT INTO expenses (title, amount, category, note, date) VALUES (?, ?, ?, ?, ?);',
    title,
    amount,
    category,
    note || '',
    date,
  );
  return result.lastInsertRowId;
};

/**
 * Fetch all expenses ordered by date descending.
 */
export const fetchExpenses = async () => {
  const db = await getDB();
  return db.getAllAsync('SELECT * FROM expenses ORDER BY date DESC;');
};

/**
 * Fetch expenses filtered by month (YYYY-MM) or year (YYYY).
 */
export const fetchExpensesByPeriod = async (period) => {
  const db = await getDB();
  return db.getAllAsync(
    'SELECT * FROM expenses WHERE strftime(?, date) = ? ORDER BY date DESC;',
    period.length === 7 ? '%Y-%m' : '%Y',
    period,
  );
};

/**
 * Delete an expense by id.
 */
export const deleteExpense = async (id) => {
  const db = await getDB();
  await db.runAsync('DELETE FROM expenses WHERE id = ?;', id);
};
