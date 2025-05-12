// 📁 routes/tokens.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// ▶ 1. 전체 토큰 목록 조회
// GET /api/admin/tokens
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, symbol, description, total_supply, circulating_supply, decimals, created_at, updated_at FROM tokens ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('❌ 토큰 목록 조회 실패:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch tokens' });
  }
});

// ▶ 2. 단일 토큰 조회
// GET /api/admin/tokens/:id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [[token]] = await db.query(
      'SELECT * FROM tokens WHERE id = ?', [id]
    );
    if (!token) return res.status(404).json({ success: false, error: 'Token not found' });
    res.json({ success: true, data: token });
  } catch (err) {
    console.error('❌ 토큰 조회 실패:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch token' });
  }
});

// ▶ 3. 토큰 생성
// POST /api/admin/tokens
router.post('/', async (req, res) => {
  try {
    const { name, symbol, description, total_supply, decimals } = req.body;
    const id = uuidv4();
    await db.query(
      `INSERT INTO tokens (id, name, symbol, description, total_supply, circulating_supply, decimals, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, NOW(), NOW())`,
      [id, name, symbol, description, total_supply, decimals]
    );
    res.json({ success: true, data: { id } });
  } catch (err) {
    console.error('❌ 토큰 생성 실패:', err);
    res.status(500).json({ success: false, error: 'Failed to create token' });
  }
});

// ▶ 4. 토큰 수정
// PUT /api/admin/tokens/:id
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, symbol, description, total_supply, decimals } = req.body;
    await db.query(
      `UPDATE tokens SET name=?, symbol=?, description=?, total_supply=?, decimals=?, updated_at=NOW() WHERE id=?`,
      [name, symbol, description, total_supply, decimals, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 토큰 수정 실패:', err);
    res.status(500).json({ success: false, error: 'Failed to update token' });
  }
});

// ▶ 5. 토큰 삭제
// DELETE /api/admin/tokens/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM tokens WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 토큰 삭제 실패:', err);
    res.status(500).json({ success: false, error: 'Failed to delete token' });
  }
});
// ▶ 전체 교환 로그 조회 API
// GET /api/wallet-logs/exchange
router.get("/wallet-logs/exchange", async (req, res, next) => {
    try {
      const [logs] = await db.query(
        `SELECT
           id,
           user_id,
           category,
           log_date,
           direction,
           amount,
           balance_after,
           reference_type,
           reference_id,
           description,
           created_at,
           updated_at
         FROM wallets_log
         WHERE reference_type = 'token_exchange'
         ORDER BY log_date DESC`
      );
      res.json({ success: true, data: logs });
    } catch (err) {
      console.error("❌ /wallet-logs/exchange error:", err);
      next(err);
    }
  });
module.exports = router;
