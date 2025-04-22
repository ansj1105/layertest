///routes/messages.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔔 시스템 공지 목록
router.get('/notices', async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM notices ORDER BY created_at DESC LIMIT 50`);
  res.json(rows);
});

// 📩 내 메시지 목록
router.get('/inbox', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: "로그인이 필요합니다." });

  const [rows] = await db.query(`SELECT * FROM user_messages WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
  res.json(rows);
});

module.exports = router;
