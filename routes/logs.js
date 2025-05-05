// 📁 routes/walletLogs.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/logs/transfer-logs
// 사용자의 펀드↔실계정 이관 내역 조회
router.get('/transfer-logs', async (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const [rows] = await db.query(
      `SELECT
         id,
         direction       AS type,        -- 'fund_to_quant' | 'quant_to_fund'
         amount,
         fee,
         (amount - fee)  AS netAmount,   -- 순 이체 수량
         before_fund     AS beforeFund,
         after_fund      AS afterFund,
         before_quant    AS beforeQuant,
         after_quant     AS afterQuant,
         created_at      AS createdAt
       FROM wallet_transfer_logs
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('❌ transfer-logs 오류:', err);
    res.status(500).json({ success: false, error: 'transfer-logs failed' });
  }
});


// ✅ funding-profits 조회 (user_id를 investment_id를 통해 추적)
router.get('/funding-profits', async (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const [rows] = await db.query(
      `SELECT
         fpl.id,
         fpl.profit AS amount,
         fpl.profit_date AS date,
         fpl.created_at AS createdAt
       FROM funding_profits_log fpl
       JOIN funding_investments i ON fpl.investment_id = i.id
       WHERE i.user_id = ?
       ORDER BY fpl.created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('❌ funding-profits 오류:', err);
    res.status(500).json({ success: false, error: 'funding-profits failed' });
  }
});

module.exports = router;
