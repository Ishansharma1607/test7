
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const { authMiddleware, loginHandler, logoutHandler } = require('./auth');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', loginHandler);

app.get('/logout', logoutHandler);

app.get('/app', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.post('/save-text', authMiddleware, (req, res) => {
  const { text } = req.body;
  const insertQuery = db.prepare('INSERT INTO user_text (text_content) VALUES (?)');
  insertQuery.run(JSON.stringify(text));
  res.redirect('/app');
});

app.get('/load-text', authMiddleware, (req, res) => {
  const selectQuery = db.prepare('SELECT text_content FROM user_text ORDER BY id DESC LIMIT 1');
  const row = selectQuery.get();
  res.json(row ? JSON.parse(row.text_content) : '');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
