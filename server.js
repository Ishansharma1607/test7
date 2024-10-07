
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
app.use('/styles', express.static(path.join(__dirname, 'styles')));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', loginHandler);

app.get('/logout', logoutHandler);

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.post('/save-text', authMiddleware, (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    res.status(400).send({ error: 'Invalid text' });
    return;
  }

  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    res.status(400).send({ error: 'Text cannot be empty' });
    return;
  }

  const insertQuery = db.prepare('INSERT INTO user_text (text_content) VALUES (?)');
  insertQuery.run(JSON.stringify(trimmedText));
  res.redirect('/app');
});

app.get('/load-text', authMiddleware, (req, res) => {
  const selectQuery = db.prepare('SELECT text_content FROM user_text ORDER BY id DESC LIMIT 1');
  const row = selectQuery.get();

  try {
    const textContent = row ? JSON.parse(row.text_content) : '';
    res.send(textContent);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    res.status(500).json({ error: 'Failed to parse text content' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
