// 📁 routes/mydata.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// ── 내 대시보드 요약 API ───────────────────────────────────────
// GET /api/mydata/summary
router.get('/summary', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    // 1) 지갑 잔액 (quant + fund)
    const [[wallet]] = await db.query(
      `SELECT
         IFNULL(quant_balance,0)     AS quant_balance,
         IFNULL(fund_balance,0)      AS fund_balance,
         IFNULL(quant_balance,0) + IFNULL(fund_balance,0) AS total_balance
       FROM wallets
       WHERE user_id = ?`,
      [userId]
    );

    // 2) 레퍼럴 수익 (referral_rewards)
    const [[refRev]] = await db.query(
      `SELECT
         IFNULL(SUM(amount),0) AS total,
         IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE() THEN amount END),0) AS today,
         IFNULL(SUM(CASE WHEN DATE(created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) THEN amount END),0) AS yesterday
       FROM referral_rewards
       WHERE user_id = ?`,
      [userId]
    );

    // 3) 투자 수익 (funding_investments.profit)
    const [[invRev]] = await db.query(
      `SELECT
         IFNULL(SUM(profit),0) AS total,
         IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE() THEN profit END),0) AS today,
         IFNULL(SUM(CASE WHEN DATE(created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) THEN profit END),0) AS yesterday
       FROM funding_investments
       WHERE user_id = ?`,
      [userId]
    );

    // 4) 양적거래 수익 (quant_trades.user_earning)
    const [[tradeRev]] = await db.query(
      `SELECT
         IFNULL(SUM(user_earning),0) AS total,
         IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE() THEN user_earning END),0) AS today,
         IFNULL(SUM(CASE WHEN DATE(created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) THEN user_earning END),0) AS yesterday
       FROM quant_trades
       WHERE user_id = ?`,
      [userId]
    );

    // 5) 레퍼럴 계층별 가입자 수 (level 2=A,3=B,4=C)
    const [[cntA]] = await db.query(
      `SELECT COUNT(*) AS count
       FROM referral_relations
       WHERE referrer_id = ? AND level = 2 AND status = 'active'`,
      [userId]
    );
    const [[cntB]] = await db.query(
      `SELECT COUNT(*) AS count
       FROM referral_relations
       WHERE referrer_id = ? AND level = 3 AND status = 'active'`,
      [userId]
    );
    const [[cntC]] = await db.query(
      `SELECT COUNT(*) AS count
       FROM referral_relations
       WHERE referrer_id = ? AND level = 4 AND status = 'active'`,
      [userId]
    );

    return res.json({
      success: true,
      data: {
        balance: {
          quant: wallet.quant_balance,
          fund: wallet.fund_balance,
          total: wallet.total_balance
        },
        earnings: {
          referral: {
            total: Number(refRev.total),
            today: Number(refRev.today),
            yesterday: Number(refRev.yesterday)
          },
          investment: {
            total: Number(invRev.total),
            today: Number(invRev.today),
            yesterday: Number(invRev.yesterday)
          },
          trade: {
            total: Number(tradeRev.total),
            today: Number(tradeRev.today),
            yesterday: Number(tradeRev.yesterday)
          }
        },
        referrals: {
          level2: cntA.count,
          level3: cntB.count,
          level4: cntC.count
        }
      }
    });
  } catch (err) {
    console.error('❌ 대시보드 요약 조회 오류:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
