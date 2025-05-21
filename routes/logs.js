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

router.get('/quant-profits', async (req, res) => {
  // 1) 세션에서 user 확인
  const user = req.session.user;
  if (!user?.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // 2) quant_profits 테이블에서 해당 user_id 로 조회
    const [rows] = await db.query(
      `SELECT 
         id,
         trade_id,
         amount,
         type,
         level,
         created_at
       FROM quant_profits
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user.id]
    );

    // 3) 결과 반환
    return res.json({ data: rows });
  } catch (err) {
    console.error('Error fetching quant profits:', err);
    return res.status(500).json({ error: 'Failed to fetch quant profits' });
  }
});

router.get('/wallets-log', async (req, res) => {
  const user = req.session.user;
  if (!user?.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const [rows] = await db.query(
      `SELECT
         id,
         category,
         log_date   AS logDate,
         direction,
         amount,
         balance_after   AS balanceAfter,
         reference_type  AS referenceType,
         reference_id    AS referenceId,
         description,
         created_at      AS createdAt
       FROM wallets_log
       WHERE user_id = ?
       ORDER BY log_date DESC`,
      [user.id]
    );

    return res.json({ data: rows });
  } catch (err) {
    console.error('Error fetching wallets_log:', err);
    return res.status(500).json({ error: 'Failed to fetch wallet logs' });
  }
});

// 관리자용 전체 유저 지갑 로그 조회
router.get('/admin/wallets-log', async (req, res) => {
  const user = req.session.user;
  if (!user?.id || !user.isAdmin) {
    return res.status(401).json({ error: 'Not authenticated as admin' });
  }

  try {
    const [rows] = await db.query(
      `SELECT
         wl.id,
         wl.user_id,
         u.email,
         wl.category,
         wl.log_date   AS logDate,
         wl.direction,
         wl.amount,
         wl.balance_after   AS balanceAfter,
         wl.reference_type  AS referenceType,
         wl.reference_id    AS referenceId,
         wl.description,
         wl.created_at      AS createdAt
       FROM wallets_log wl
       LEFT JOIN users u ON wl.user_id = u.id
       ORDER BY wl.log_date DESC
       LIMIT 500` // 필요시 페이징/제한
    );

    return res.json({ data: rows });
  } catch (err) {
    console.error('Error fetching all wallets_log:', err);
    return res.status(500).json({ error: 'Failed to fetch all wallet logs' });
  }
});

router.get('/quant-profits2', async (req, res) => {
  const user = req.session.user;
  if (!user?.id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
  const [rows] = await db.query(
    `SELECT 
       id,
       trade_id    AS tradeId,
       amount,
       type,
       level,
       created_at  AS createdAt
     FROM quant_profits
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [user.id]
  );
  res.json({ data: rows });
}
  catch (err) {
    console.error('Error fetching wallets_log:', err);
    return res.status(500).json({ error: 'Failed to fetch wallet logs' });
  }
});
module.exports = router;
