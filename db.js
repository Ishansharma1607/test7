
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Define the source and destination paths
const srcDbPath = path.resolve(__dirname, 'user_data.db');
const destDbPath = path.resolve(__dirname, 'data', 'user_data.db');

// Copy the database file to a writable directory
if (!fs.existsSync(destDbPath)) {
  fs.copyFileSync(srcDbPath, destDbPath);
}

let db;
try {
  db = new Database(destDbPath);
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
