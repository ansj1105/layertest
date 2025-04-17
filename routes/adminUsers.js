// 📁 routes/adminUsers.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 전체 사용자 목록 조회
router.get('/users', async (req, res) => {
  const [users] = await db.query(`SELECT id, name, email, created_at, is_active, is_blocked, last_login FROM users ORDER BY created_at DESC`);
  res.json(users);
});

// 사용자 활성/비활성 상태 토글
router.patch('/users/:id/status', async (req, res) => {
  const { is_active } = req.body;
  await db.query(`UPDATE users SET is_active = ? WHERE id = ?`, [is_active, req.params.id]);
  res.json({ success: true });
});

// 사용자 차단/해제
router.patch('/users/:id/block', async (req, res) => {
  const { is_blocked } = req.body;
  await db.query(`UPDATE users SET is_blocked = ? WHERE id = ?`, [is_blocked, req.params.id]);
  res.json({ success: true });
});

// 휴면 계정 필터링 (30일 이상 로그인 기록 없음)
router.get('/users/dormant', async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM users WHERE last_login IS NULL OR last_login < NOW() - INTERVAL 30 DAY`);
  res.json(rows);
});

// 다중 로그인 감지 계정 (임시 예: 로그인 로그 기반 구현 가능)
router.get('/users/suspicious', async (req, res) => {
  const [rows] = await db.query(`
    SELECT user_id, COUNT(DISTINCT ip_address) as ip_count
    FROM user_access_logs
    WHERE created_at > NOW() - INTERVAL 1 DAY
    GROUP BY user_id
    HAVING ip_count >= 3
  `);
  res.json(rows);
});

module.exports = router;
