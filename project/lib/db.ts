import { sqlite, sqlite3 } from "./express";

/**
 * Retrieves a database connection.
 * @returns {Promise<sqlite3.Database>} A promise that resolves to the database connection.
 */
export async function getDBConnection() {
  const db = await sqlite.open({filename: 'store.db', driver: sqlite3.Database});
  return db;
 }