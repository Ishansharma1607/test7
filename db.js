
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.resolve(__dirname, 'user_data.db');
const db = new Database(dbPath);

// Create table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS user_text (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text_content TEXT NOT NULL
  )
`;
db.exec(createTableQuery);

module.exports = db;
