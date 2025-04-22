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
// 삭제 API 추가
router.delete('/content-files/:id', async (req, res) => {
    const { id } = req.params;
  
    // DB에서 파일 정보 조회
    const [[file]] = await db.query('SELECT file_path FROM content_files WHERE id = ?', [id]);
    if (!file) return res.status(404).json({ error: '파일을 찾을 수 없습니다' });
  
    const fullPath = path.join(__dirname, '..', 'public', file.file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath); // 실제 파일 삭제
    }
  
    // DB에서 레코드 삭제
    await db.query('DELETE FROM content_files WHERE id = ?', [id]);
    res.json({ success: true });
  });
module.exports = router;
