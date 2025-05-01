// 📁 routes/mydata.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// ── 내 대시보드 요약 API ───────────────────────────────────────
// GET /api/mydata/summary

router.get('/summary', async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
      // 1) 지갑 잔액
      const [walletRows] = await db.query(
        'SELECT IFNULL(fund_balance,0) AS fund, IFNULL(quant_balance,0) AS quant FROM wallets WHERE user_id = ?',
        [userId]
      );
      const wallet = walletRows[0] || { fund: 0, quant: 0 };
  
      // 2) 추천 리워드
      const [[rewardRows]] = await db.query(`
        SELECT
          IFNULL(SUM(amount),0) AS total,
          IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE() THEN amount END),0) AS today,
          IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE()-INTERVAL 1 DAY THEN amount END),0) AS yesterday
        FROM referral_rewards
        WHERE user_id = ?
      `, [userId]);
  
      // 3) 투자 수익
      const [[investRows]] = await db.query(`
        SELECT
          IFNULL(SUM(profit),0) AS total,
          IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE() THEN profit END),0) AS today,
          IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE()-INTERVAL 1 DAY THEN profit END),0) AS yesterday
        FROM funding_investments
        WHERE user_id = ?
      `, [userId]);
  
      // 4) 양적거래 수익
      const [[tradeRows]] = await db.query(`
        SELECT
          IFNULL(SUM(user_earning),0) AS total,
          IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE() THEN user_earning END),0) AS today,
          IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE()-INTERVAL 1 DAY THEN user_earning END),0) AS yesterday
        FROM quant_trades
        WHERE user_id = ?
      `, [userId]);
  
      // 5) 레퍼럴 하위 가입자 수
      const [[refRows]] = await db.query(`
        SELECT
          SUM(level=2 AND status='active') AS level2,
          SUM(level=3 AND status='active') AS level3,
          SUM(level=4 AND status='active') AS level4
        FROM referral_relations
        WHERE referrer_id = ?
      `, [userId]);
  
      return res.json({
        success: true,
        data: {
          balance: {
            total: Number(wallet.fund) + Number(wallet.quant)
          },
          earnings: {
            referral: {
              total: Number(rewardRows.total),
              today: Number(rewardRows.today),
              yesterday: Number(rewardRows.yesterday),
            },
            investment: {
              total: Number(investRows.total),
              today: Number(investRows.today),
              yesterday: Number(investRows.yesterday),
            },
            trade: {
              total: Number(tradeRows.total),
              today: Number(tradeRows.today),
              yesterday: Number(tradeRows.yesterday),
            }
          },
          referrals: {
            level2: refRows.level2 || 0,
            level3: refRows.level3 || 0,
            level4: refRows.level4 || 0,
          }
        }
      });
    } catch (err) {
      console.error('❌ /api/mydata/summary 오류:', err);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  router.get('/me', async (req, res) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
  
      const [[user]] = await db.query(
        'SELECT id, name, vip_level FROM users WHERE id = ?',
        [userId]
      );
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
  
      // 프론트에서 res.data.user 로 바로 꺼낼 수 있게
      return res.json({ success: true, user });
    } catch (err) {
      console.error('❌ /api/mydata/me 오류:', err);
      return res.status(500).json({ success: false, error: 'Server error' });
    }
  });
module.exports = router;
