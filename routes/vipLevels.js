// 📁 routes/vipLevels.js
const express = require('express');
const db = require('../db');
const router = express.Router();

// ✅ 모든 VIP 레벨 조회
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM vip_levels ORDER BY level ASC');
  res.json({ success: true, data: rows });
});

// ✅ 새 VIP 레벨 추가
router.post('/', async (req, res) => {
  const {
    level, daily_trade_limit, commission_min, commission_max,
    max_investment, daily_commission_max, min_holdings,
    min_A, min_B, min_C
  } = req.body;

  await db.query(
    `INSERT INTO vip_levels
    (level, daily_trade_limit, commission_min, commission_max, max_investment, daily_commission_max, min_holdings, min_A, min_B, min_C)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [level, daily_trade_limit, commission_min, commission_max, max_investment, daily_commission_max, min_holdings, min_A, min_B, min_C]
  );
  res.json({ success: true });
});

// ✅ 특정 VIP 레벨 수정
router.put('/:level', async (req, res) => {
  const {
    daily_trade_limit, commission_min, commission_max,
    max_investment, daily_commission_max, min_holdings,
    min_A, min_B, min_C
  } = req.body;

  await db.query(
    `UPDATE vip_levels SET
    daily_trade_limit=?, commission_min=?, commission_max=?, max_investment=?,
    daily_commission_max=?, min_holdings=?, min_A=?, min_B=?, min_C=?
    WHERE level = ?`,
    [daily_trade_limit, commission_min, commission_max, max_investment,
     daily_commission_max, min_holdings, min_A, min_B, min_C, req.params.level]
  );
  res.json({ success: true });
});

// ✅ 특정 VIP 레벨 삭제
router.delete('/:level', async (req, res) => {
  await db.query('DELETE FROM vip_levels WHERE level = ?', [req.params.level]);
  res.json({ success: true });
});

// ✅ VIP 조건 계산 함수 (서버 내에서 사용할 수 있음)
async function getNewVipLevel(usdtBalance, referralCounts, db) {
  const [levels] = await db.query('SELECT * FROM vip_levels ORDER BY level DESC');
  
  for (const l of levels) {
    if (
      usdtBalance >= l.min_holdings &&
      referralCounts.A >= l.min_A &&
      referralCounts.B >= l.min_B &&
      referralCounts.C >= l.min_C
    ) {
      return l.level;
    }
  }
  return 1;
}

module.exports = { router, getNewVipLevel };
