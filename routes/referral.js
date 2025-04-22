const express = require('express');
const db = require('../db');
const router = express.Router();

// 추천 코드 생성 (6자리 16진수)
function generateReferralCode() {
  return [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
}

// 현재 사용자 추천 코드 조회
router.get('/code', async (req, res) => {
  const userId = req.user.id;
  const [rows] = await db.query('SELECT referral_code, referral_level FROM users WHERE id = ?', [userId]);
  const code = rows[0]?.referral_code;

  res.json({
    success: true,
    data: {
      referralCode: code,
      referralUrl: `https://example.com/ref/${code}`,
    },
  });
});

// 추천 코드 유효성 검사
router.get('/verify/:code', async (req, res) => {
  const { code } = req.params;
  const [rows] = await db.query('SELECT username FROM users WHERE referral_code = ?', [code]);
  res.json({
    success: true,
    data: {
      valid: rows.length > 0,
      referrerUsername: rows[0]?.username || null,
    },
  });
});

// 추천 코드로 가입
router.post('/register', async (req, res) => {
  const { username, email, password, referralCode } = req.body;

  let referrerId = null;
  let level = 1;

  if (referralCode) {
    const [referrer] = await db.query('SELECT id FROM users WHERE referral_code = ?', [referralCode]);
    if (referrer.length > 0) {
      referrerId = referrer[0].id;
      level = 2;
    }
  }

  const newCode = generateReferralCode();
  const [result] = await db.query('INSERT INTO users (username, email, password, referral_code, referrer_id, referral_level) VALUES (?, ?, ?, ?, ?, ?)', [username, email, password, newCode, referrerId, level]);

  const userId = result.insertId;

  if (referrerId) {
    await db.query('INSERT INTO referral_relations (referrer_id, referred_id, level) VALUES (?, ?, ?)', [referrerId, userId, level]);
    await db.query('INSERT INTO referral_history (user_id, action, previous_level, new_level, metadata) VALUES (?, "signup", NULL, ?, ?)', [userId, level, JSON.stringify({ referrerId })]);
  }

  res.json({
    success: true,
    message: "회원가입 완료",
    data: { userId, referralCode: newCode, referralLevel: level }
  });
});

// 내 추천 네트워크 보기
router.get('/network', async (req, res) => {
    try {
      const userId = req.session.user?.id; // ✅ 여기로 수정!
      if (!userId) return res.status(401).json({ error: '인증되지 않은 사용자' });
  
      const [relations] = await db.query(`
        SELECT r.*, u.name AS username, u.created_at, u.is_active AS status
        FROM referral_relations r
        JOIN users u ON r.referred_id = u.id
        WHERE r.referrer_id = ?
      `, [userId]);
  
      res.json({ success: true, data: relations });
    } catch (err) {
      console.error("❌ 추천 네트워크 조회 오류:", err.message);
      res.status(500).json({ error: '서버 오류' });
    }
  });
  
  
  
// 레퍼럴 보상 비율 조회
router.get('/reward-settings', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM referral_rewards LIMIT 1');
    res.json({
      success: true,
      data: rows[0] || { levelA: 0, levelB: 0, levelC: 0 }
    });
  });
  
  // 레퍼럴 보상 비율 설정
  router.put('/reward-settings', async (req, res) => {
    const { levelA, levelB, levelC } = req.body;
  
    const [existing] = await db.query('SELECT * FROM referral_rewards LIMIT 1');
  
    if (existing.length > 0) {
      await db.query('UPDATE referral_rewards SET levelA = ?, levelB = ?, levelC = ? WHERE id = ?', [
        levelA, levelB, levelC, existing[0].id
      ]);
    } else {
      await db.query('INSERT INTO referral_rewards (levelA, levelB, levelC) VALUES (?, ?, ?)', [
        levelA, levelB, levelC
      ]);
    }
  
    res.json({ success: true });
  });

  // ✅ 내 팀(계층 구조) 조회 API
router.get("/my-team", async (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
  
    try {
      const [[me]] = await db.query(`SELECT referrer_id FROM users WHERE id = ?`, [userId]);
  
      // 발기인 S (최상위 추천인)
      let S = null;
      if (me.referrer_id) {
        const [[referrer]] = await db.query(`SELECT id, name, email FROM users WHERE id = ?`, [me.referrer_id]);
        S = referrer;
      }
  
      // 하위 추천자 계층 A, B, C
      const [A] = await db.query(`SELECT id, name, email FROM users WHERE referrer_id = ? AND referral_level = 2`, [userId]);
      const A_ids = A.map(u => u.id);
      const B = A_ids.length
        ? await db.query(`SELECT id, name, email FROM users WHERE referrer_id IN (?) AND referral_level = 3`, [A_ids])
        : [[]];
      const B_ids = B[0].map(u => u.id);
      const C = B_ids.length
        ? await db.query(`SELECT id, name, email FROM users WHERE referrer_id IN (?) AND referral_level = 4`, [B_ids])
        : [[]];
  
      return res.json({
        success: true,
        data: {
          S,
          A,
          B: B[0],
          C: C[0]
        }
      });
    } catch (err) {
      console.error("❌ 팀 조회 오류:", err);
      res.status(500).json({ error: "내 팀 조회 실패" });
    }
  });
  // 📁 routes/referral.js
router.get('/stats', async (req, res) => {
    const userId = req.user.id;
  
    const [[stats]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM referral_relations WHERE referrer_id = ?) AS totalMembers,
        (SELECT COUNT(*) FROM referral_relations WHERE referrer_id = ? AND DATE(created_at) = CURDATE()) AS todayJoined,
        (SELECT IFNULL(SUM(amount), 0) FROM referral_rewards WHERE user_id = ?) AS totalEarnings,
        (SELECT IFNULL(SUM(amount), 0) FROM referral_rewards WHERE user_id = ? AND DATE(created_at) = CURDATE()) AS todayEarnings
    `, [userId, userId, userId, userId]);
  
    res.json(stats);
  });
  
module.exports = router;
