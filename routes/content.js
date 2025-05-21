const express = require('express');
const { body, param, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const db = require('../db');
const router = express.Router();

// 테이블 구조 업데이트를 위한 초기화 함수
async function initializeTable() {
  try {
    // type enum에 'pdf' 추가
    await db.query(`
      ALTER TABLE content_files 
      MODIFY COLUMN type ENUM('banner', 'video', 'pdf') NOT NULL
    `);

    // status enum에 'inactive' 추가
    await db.query(`
      ALTER TABLE content_files 
      MODIFY COLUMN status ENUM('active', 'inactive', 'deleted') NOT NULL DEFAULT 'active'
    `);
  } catch (err) {
    console.error('Table initialization error:', err);
  }
}

// 서버 시작시 테이블 초기화
initializeTable();

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdir(UPLOAD_DIR, { recursive: true });

// multer 설정: 확장자·크기 제한
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.jpg','.jpeg','.png','.mp4','.mov','.pdf'];
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

// PDF 업로드
router.post(
  '/upload/pdf',
  upload.single('pdf'),
  body('type').optional().isIn(['pdf']),
  validate,
  (req, res, next) => handleUpload(req, res, 'pdf')
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

// PDF 파일 상세 조회
router.get(
  '/content-files/:id',
  param('id').isInt(),
  validate,
  async (req, res, next) => {
    try {
      const [rows] = await db.query(
        `SELECT id, type, file_path, created_at, status
         FROM content_files
         WHERE id = ?`,
        [req.params.id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다' });
      }
      
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// PDF 파일 수정 (상태 변경)
router.patch(
  '/content-files/:id',
  param('id').isInt(),
  body('status').isIn(['active', 'inactive', 'deleted']),
  validate,
  async (req, res, next) => {
    try {
      const [result] = await db.query(
        `UPDATE content_files
         SET status = ?
         WHERE id = ?`,
        [req.body.status, req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다' });
      }

      res.json({ success: true, message: '상태가 업데이트되었습니다' });
    } catch (err) {
      next(err);
    }
  }
);

// PDF 파일 영구 삭제
router.delete(
  '/content-files/:id/permanent',
  param('id').isInt(),
  validate,
  async (req, res, next) => {
    const id = req.params.id;
    try {
      // 1) 파일 정보 조회
      const [[file]] = await db.query(
        'SELECT file_path FROM content_files WHERE id = ?',
        [id]
      );

      if (!file) {
        return res.status(404).json({ error: '파일을 찾을 수 없습니다' });
      }

      // 2) DB에서 삭제
      await db.query('DELETE FROM content_files WHERE id = ?', [id]);

      // 3) 실제 파일 삭제
      if (file.file_path) {
        const absPath = path.join(__dirname, '..', 'public', file.file_path);
        try {
          await fs.unlink(absPath);
        } catch (err) {
          console.error('파일 삭제 실패:', absPath, err.message);
          // 필요하다면 return res.status(500).json({ error: '파일 삭제 실패' });
        }
      }

      res.json({ success: true, message: '파일이 영구적으로 삭제되었습니다' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
