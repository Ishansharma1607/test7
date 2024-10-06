
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'user_data.db');

let db;
try {
  db = new Database(dbPath);
} catch (err) {
  console.error('Failed to open database:', err);
  throw err;
}

// Create table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS user_text (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text_content TEXT NOT NULL
  )
`;
db.exec(createTableQuery);

module.exports = db;
