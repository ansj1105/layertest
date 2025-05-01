// 📁 routes/adminJoinRewards.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// ── 규칙 조회
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM join_rewards ORDER BY id');
  res.json({ success:true, data: rows });
});

// ── 규칙 추가
router.post('/', async (req, res) => {
  const { amount, required_balance } = req.body;
  await db.query(
    'INSERT INTO join_rewards (amount, required_balance) VALUES (?, ?)',
    [amount, required_balance]
  );
  res.json({ success:true });
});

// ── 규칙 수정
router.put('/:id', async (req, res) => {
  const { amount, required_balance } = req.body;
  await db.query(
    'UPDATE join_rewards SET amount=?, required_balance=? WHERE id=?',
    [amount, required_balance, req.params.id]
  );
  res.json({ success:true });
});

// ── 규칙 삭제
router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM join_rewards WHERE id=?', [req.params.id]);
  res.json({ success:true });
});

// ── 수령 내역 조회
router.get('/claims', async (req, res) => {
  const [rows] = await db.query(`
    SELECT ujr.id,
           ujr.user_id,
           u.email,
           ujr.join_reward_id,
           jr.amount,
           jr.required_balance,
           ujr.claimed,
           ujr.claimed_at
      FROM user_join_rewards ujr
      JOIN users u  ON u.id = ujr.user_id
      JOIN join_rewards jr ON jr.id = ujr.join_reward_id
     ORDER BY ujr.claimed_at DESC
  `);
  res.json({ success:true, data: rows });
});

module.exports = router;
