// 📁 routes/content.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 배너 이미지 업로드
router.post('/upload/banner', upload.single('banner'), async (req, res) => {
  const filePath = `/uploads/${req.file.filename}`;
  await db.query('INSERT INTO content_files (type, file_path) VALUES (?, ?)', ['banner', filePath]);
  res.json({ message: 'Banner uploaded', filePath });
});

// 동영상 업로드
router.post('/upload/video', upload.single('video'), async (req, res) => {
  const filePath = `/uploads/${req.file.filename}`;
  await db.query('INSERT INTO content_files (type, file_path) VALUES (?, ?)', ['video', filePath]);
  res.json({ message: 'Video uploaded', filePath });
});

// 리스트 조회
router.get('/content-files', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM content_files ORDER BY id DESC');
  res.json(rows);
});

module.exports = router;
