const express = require('express');
const { body, param, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const db = require('../db');
const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdir(UPLOAD_DIR, { recursive: true });

// multer 설정: 확장자·크기 제한
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.jpg','.jpeg','.png','.mp4','.mov'];
    if (!allowed.includes(ext)) {
      return cb(new Error('지원하지 않는 파일 형식입니다'));
    }
    cb(null, true);
  }
});

// 에러 검증 미들웨어
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// 1) 업로드 공통 로직
async function handleUpload(req, res, type) {
  const filePath = `/uploads/${req.file.filename}`;
  try {
    await db.query(
      'INSERT INTO content_files (type, file_path) VALUES (?, ?)',
      [type, filePath]
    );
    res.status(201).json({ message: `${type} uploaded`, filePath });
  } catch (err) {
    // DB 삽입 실패 시 파일 삭제
    await fs.unlink(path.join(UPLOAD_DIR, req.file.filename)).catch(()=>{});
    next(err);
  }
}

// 배너 업로드
router.post(
  '/upload/banner',
  upload.single('banner'),
  body('type').optional().isIn(['banner']),
  validate,
  (req, res, next) => handleUpload(req, res, 'banner')
);

// 동영상 업로드
router.post(
  '/upload/video',
  upload.single('video'),
  body('type').optional().isIn(['video']),
  validate,
  (req, res, next) => handleUpload(req, res, 'video')
);

// 리스트 조회(활성된 것만)
router.get('/content-files', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT id, type, file_path, created_at
       FROM content_files
       WHERE status = 'active'
       ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 소프트 삭제 API
router.delete(
  '/content-files/:id',
  param('id').isInt(),
  validate,
  async (req, res, next) => {
    const id = req.params.id;
    try {
      // 1) 상태 변경
      const [result] = await db.query(
        `UPDATE content_files
         SET status = 'deleted'
         WHERE id = ? AND status = 'active'`,
        [id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '파일을 찾을 수 없거나 이미 삭제됨' });
      }

      // 2) 실제 파일 삭제(optional)
      const [[file]] = await db.query(
        'SELECT file_path FROM content_files WHERE id = ?',
        [id]
      );
      if (file?.file_path) {
        await fs.unlink(path.join(__dirname, '..', 'public', file.file_path)).catch(()=>{});
      }

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
