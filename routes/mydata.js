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

    // 2) 추천 리워드 (기존)
    const [[rewardRows]] = await db.query(`
      SELECT
        IFNULL(SUM(amount),0) AS total,
        IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE() THEN amount END),0) AS today,
        IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE()-INTERVAL 1 DAY THEN amount END),0) AS yesterday
      FROM referral_rewards
      WHERE user_id = ?
    `, [userId]);

    // 3) 투자 수익 (기존)
    const [[investRows]] = await db.query(`
      SELECT
        IFNULL(SUM(profit),0) AS total,
        IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE() THEN profit END),0) AS today,
        IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE()-INTERVAL 1 DAY THEN profit END),0) AS yesterday
      FROM funding_investments
      WHERE user_id = ?
    `, [userId]);

    // 4) 양적거래 수익 (기존)
    const [[tradeRows]] = await db.query(`
      SELECT
        IFNULL(SUM(user_earning),0) AS total,
        IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE() THEN user_earning END),0) AS today,
        IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE()-INTERVAL 1 DAY THEN user_earning END),0) AS yesterday
      FROM quant_trades
      WHERE user_id = ?
    `, [userId]);

    // 5) 레퍼럴 하위 가입자 수 (기존)
    const [[refRows]] = await db.query(`
      SELECT
        SUM(level=1 AND status='active') AS level2,
        SUM(level=2 AND status='active') AS level3,
        SUM(level=3 AND status='active') AS level4
      FROM referral_relations
      WHERE referrer_id = ?
    `, [userId]);

    // 6) quant_profits에서 'referral' 타입 합계 (신규)
    const [[qprofRows]] = await db.query(`
      SELECT
        IFNULL(SUM(amount),0) AS total,
        IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE() THEN amount END),0) AS today,
        IFNULL(SUM(CASE WHEN DATE(created_at)=CURDATE()-INTERVAL 1 DAY THEN amount END),0) AS yesterday
      FROM quant_profits
      WHERE user_id = ? AND type = 'referral'
    `, [userId]);

    return res.json({
      success: true,
      data: {
        balance: {
          total: Number(wallet.fund) + Number(wallet.quant)
        },
        earnings: {
          referralRewards: {    // 기존 referral_rewards
            total: Number(rewardRows.total),
            today: Number(rewardRows.today),
            yesterday: Number(rewardRows.yesterday),
          },
          quantReferrals: {     // 신규 quant_profits referral
            total: Number(qprofRows.total),
            today: Number(qprofRows.today),
            yesterday: Number(qprofRows.yesterday),
          },
          investment: {         // funding_investments
            total: Number(investRows.total),
            today: Number(investRows.today),
            yesterday: Number(investRows.yesterday),
          },
          trade: {              // quant_trades
            total: Number(tradeRows.total),
            today: Number(tradeRows.today),
            yesterday: Number(tradeRows.yesterday),
          }
        },
        referrals: {           // 하위 가입자 수
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
        'SELECT id, name, email,vip_level FROM users WHERE id = ?',
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


  // ▶ 1) 내 초대 보상 리스트 & 진행도 조회
// GET /api/mydata/invite-rewards
router.get('/invite-rewards', async (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ success:false, error:'Unauthorized' });
  
    try {
      // 1) 설정 값
      const [configs] = await db.query(`
        SELECT id, referral_level, required_referrals, reward_amount
        FROM invite_rewards
        ORDER BY referral_level
      `);
  
      // 2) 진행도 & 수령 여부 계산
      const results = await Promise.all(configs.map(async cfg => {
        // 유효 추천인 수 집계 (wallets.fund_balance >= 30 기준)
        const [[{ cnt }]] = await db.query(`
          SELECT COUNT(*) AS cnt
          FROM referral_relations rr
          JOIN wallets w ON rr.referred_id = w.user_id
          WHERE rr.referrer_id = ? AND rr.level = ? AND w.fund_balance >= 30
        `, [userId, cfg.referral_level]);
  
        // 이미 수령했는지
        const [[claimed]] = await db.query(`
          SELECT 1 FROM user_invite_rewards
          WHERE user_id = ? AND reward_id = ?
        `, [userId, cfg.id]);
  
        return {
          id: cfg.id,
          level: cfg.referral_level,
          required: cfg.required_referrals,
          amount: cfg.reward_amount,
          count: cnt,
          claimed: !!claimed
        };
      }));
  
      res.json({ success:true, data: results });
    } catch (err) {
      console.error('❌ 초대 보상 조회 오류:', err);
      res.status(500).json({ success:false, error:'Server error' });
    }
  });
  
  // ▶ 2) 보상 받기
  // POST /api/mydata/invite-rewards/claim/:id
  router.post('/invite-rewards/claim/:id', async (req, res) => {
    const userId = req.session.user?.id;
    const rewardId = req.params.id;
    if (!userId) return res.status(401).json({ success:false, error:'Unauthorized' });
  
    try {
      // 설정 가져오기
      const [[cfg]] = await db.query(`
        SELECT referral_level, required_referrals, reward_amount
        FROM invite_rewards WHERE id = ?
      `, [rewardId]);
      if (!cfg) return res.status(404).json({ success:false, error:'Not found' });
  
      // 진행도 재검사
      const [[{ cnt }]] = await db.query(`
        SELECT COUNT(*) AS cnt
        FROM referral_relations rr
        JOIN wallets w ON rr.referred_id = w.user_id
        WHERE rr.referrer_id = ? AND rr.level = ? AND w.fund_balance >= 30
      `, [userId, cfg.referral_level]);
      if (cnt < cfg.required_referrals) {
        return res.status(400).json({ success:false, error:'조건 미충족' });
      }
  
      // 중복 수령 방지
      const [[ex]] = await db.query(`
        SELECT 1 FROM user_invite_rewards
        WHERE user_id = ? AND reward_id = ?
      `, [userId, rewardId]);
      if (ex) {
        return res.status(400).json({ success:false, error:'이미 수령함' });
      }
  
      // 1) user_invite_rewards 기록
      await db.query(`
        INSERT INTO user_invite_rewards (user_id, reward_id, claimed_at)
        VALUES (?, ?, NOW())
      `, [userId, rewardId]);
  
      // 2) wallets 업데이트 (fund_balance에 보상 추가)
      await db.query(`
        UPDATE wallets
        SET fund_balance = fund_balance + ?
        WHERE user_id = ?
      `, [cfg.reward_amount, userId]);
  
      res.json({ success:true, data: { amount: cfg.reward_amount } });
    } catch (err) {
      console.error('❌ 보상 수령 실패:', err);
      res.status(500).json({ success:false, error:'Server error' });
    }
  });
  
// ── 가입 보너스 목록 ─────────────────
router.get('/join-rewards', async (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error:'로그인이 필요합니다.' });
  
    // 1) 전체 보상 조건 가져오기
    const [rewards] = await db.query(`
      SELECT jr.id, jr.amount, jr.required_balance,
             COALESCE(ujr.claimed,0) AS claimed
      FROM join_rewards jr
      LEFT JOIN user_join_rewards ujr
        ON ujr.join_reward_id = jr.id
       AND ujr.user_id = ?
      ORDER BY jr.required_balance
    `, [userId]);
  
    res.json({ success:true, data: rewards });
  });
  
  // ── 가입 보너스 수령 ─────────────────
  router.post('/join-rewards/claim/:id', async (req, res) => {
    const userId = req.session.user?.id;
    const rewardId = req.params.id;
    if (!userId) return res.status(401).json({ error:'로그인이 필요합니다.' });
  
    // 1) 보상 조건 조회
    const [[jr]] = await db.query(
      'SELECT amount, required_balance FROM join_rewards WHERE id=?',
      [rewardId]
    );
    if (!jr) return res.status(404).json({ error:'보상을 찾을 수 없습니다.' });
  
    // 2) 이미 수령했는지
    const [[ujr]] = await db.query(
      'SELECT claimed FROM user_join_rewards WHERE user_id=? AND join_reward_id=?',
      [userId, rewardId]
    );
    if (ujr?.claimed) return res.status(400).json({ error:'이미 수령하셨습니다.' });
  
    // 3) 지갑 잔액 조건 체크
    const [[wallet]] = await db.query(
      'SELECT fund_balance FROM wallets WHERE user_id=?',
      [userId]
    );
    if (!wallet || wallet.fund_balance < jr.required_balance) {
      return res.status(400).json({ error:`펀드 잔액이 ${jr.required_balance} USDT 이상이어야 합니다.` });
    }
  
    // 4) 펀드 잔액 갱신 + 수령 기록
    await db.query('UPDATE wallets SET fund_balance = fund_balance + ? WHERE user_id = ?', [jr.amount, userId]);
    await db.query(
      `INSERT INTO user_join_rewards (user_id, join_reward_id, claimed, claimed_at)
       VALUES (?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE claimed=1, claimed_at=NOW()`,
      [userId, rewardId]
    );
  
    res.json({ success:true, message:`${jr.amount} USDT 보상이 지급되었습니다.` });
  });
module.exports = router;
