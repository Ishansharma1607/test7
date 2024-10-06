
const Database = require('better-sqlite3');
const db = new Database('user_data.db');

// Create table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS user_text (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text_content TEXT NOT NULL
  )
`;
db.exec(createTableQuery);

module.exports = db;
