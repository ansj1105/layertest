const express = require('express');
const db = require('../db');
const router = express.Router();

// 전체 조회
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM popup_messages ORDER BY id DESC');
  res.json(rows);
});

// 활성된 메시지만 조회
router.get('/active', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM popup_messages WHERE is_active = 1 ORDER BY id DESC');
  res.json(rows);
});

// 생성
router.post('/', async (req, res) => {
  const { title, content } = req.body;
  await db.query('INSERT INTO popup_messages (title, content) VALUES (?, ?)', [title, content]);
  res.json({ success: true });
});

// 수정
router.put('/:id', async (req, res) => {
  const { title, content, is_active } = req.body;
  await db.query('UPDATE popup_messages SET title=?, content=?, is_active=? WHERE id=?', [title, content, is_active, req.params.id]);
  res.json({ success: true });
});

// 삭제
router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM popup_messages WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
