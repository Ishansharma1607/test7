const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const { authMiddleware, loginHandler, logoutHandler } = require('./auth');
const db = require('./db');
const fs = require('fs');

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

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Keep the original file name but make it safe for the file system
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({ storage: storage });

app.post('/upload-file', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const insertQuery = db.prepare('INSERT INTO user_files (file_name, file_path) VALUES (?, ?)');
  insertQuery.run(file.originalname, file.path);

  res.json({ success: true, message: 'File uploaded successfully' });
});

app.get('/download-file', (req, res) => {
  const selectQuery = db.prepare('SELECT file_name, file_path FROM user_files ORDER BY id DESC LIMIT 1');
  const row = selectQuery.get();

  if (!row) {
    return res.status(404).json({ success: false, message: 'No file found' });
  }

  // Check if file exists
  if (!fs.existsSync(row.file_path)) {
    return res.status(404).json({ success: false, message: 'File not found on server' });
  }

  // Set proper headers
  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${encodeURIComponent(row.file_name)}"`,
    'Content-Description': 'File Transfer'
  });

  // Stream the file
  const fileStream = fs.createReadStream(row.file_path);
  fileStream.pipe(res);

  // Handle errors during streaming
  fileStream.on('error', (error) => {
    console.error('Error streaming file:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Error downloading file' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
