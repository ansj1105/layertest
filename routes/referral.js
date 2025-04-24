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
/*
// ✅ 내 팀(계층 구조) 조회 API
router.get("/my-team", async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [[me]] = await db.query(`SELECT referrer_id FROM users WHERE id = ?`, [userId]);

    // 발기인 S (최상위 추천인)
    let S = null;
    if (me.referrer_id) {
      const [[referrer]] = await db.query(`
        SELECT id, name, email FROM users WHERE id = ?
      `, [me.referrer_id]);
      S = referrer;
    }

    const enrichUser = async (user) => {
      const [[{ team_count }]] = await db.query(`
        SELECT COUNT(*) AS team_count FROM referral_relations WHERE referrer_id = ?
      `, [user.id]);

      const [[{ total_profit }]] = await db.query(`
        SELECT IFNULL(SUM(amount), 0) AS total_profit FROM referral_rewards WHERE user_id = ?
      `, [user.id]);

      return {
        ...user,
        team_count,
        total_profit,
        last_active: user.created_at || new Date().toISOString(),
      };
    };

    // 계층 A
    const [A_raw] = await db.query(`
      SELECT id, name, email, vip_level, created_at
      FROM users
      WHERE referrer_id = ? AND referral_level = 2
    `, [userId]);
    const A = await Promise.all(A_raw.map(enrichUser));

    // 계층 B
    const A_ids = A.map(u => u.id);
    const [B_raw] = A_ids.length > 0
      ? await db.query(`
        SELECT id, name, email, vip_level, created_at
        FROM users
        WHERE referrer_id IN (?) AND referral_level = 3
      `, [A_ids])
      : [[]];
    const B = await Promise.all(B_raw.map(enrichUser));

    // 계층 C
    const B_ids = B.map(u => u.id);
    const [C_raw] = B_ids.length > 0
      ? await db.query(`
        SELECT id, name, email, vip_level, created_at
        FROM users
        WHERE referrer_id IN (?) AND referral_level = 4
      `, [B_ids])
      : [[]];
    const C = await Promise.all(C_raw.map(enrichUser));

    res.json({
      success: true,
      data: { S, A, B, C }
    });
  } catch (err) {
    console.error("❌ 팀 조회 오류:", err);
    res.status(500).json({ error: "내 팀 조회 실패" });
  }
});
*/

// ✅ 전체 유저 목록 기반으로 팀 구성 조회 + 계층 분리
// ✅ 전체 유저 목록 기반으로 팀 구성 조회 + 계층 분리 + S 발기인 포함
router.get("/my-team", async (req, res) => {
  try {
    // 전체 사용자 목록 조회
    const [users] = await db.query(`
      SELECT id, name, email, vip_level, created_at, referrer_id, referral_level
      FROM users
      ORDER BY created_at DESC
    `);

    // 사용자 보강 함수 (팀 수, 수익 등)
    const enrichUser = async (user) => {
      const [[{ team_count }]] = await db.query(
        `SELECT COUNT(*) AS team_count FROM referral_relations WHERE referrer_id = ?`,
        [user.id]
      );

      const [[{ total_profit }]] = await db.query(
        `SELECT IFNULL(SUM(amount), 0) AS total_profit FROM referral_rewards WHERE user_id = ?`,
        [user.id]
      );

      return {
        ...user,
        team_count,
        total_profit,
        last_active: user.created_at
      };
    };

    // 계층 A (referral_level 2)
    const A_raw = users.filter(u => u.referral_level === 2);
    const A = await Promise.all(A_raw.map(enrichUser));

    // 계층 B (referral_level 3, A의 하위)
    const A_ids = A.map(u => u.id);
    const B_raw = users.filter(u => u.referral_level === 3 && A_ids.includes(u.referrer_id));
    const B = await Promise.all(B_raw.map(enrichUser));

    // 계층 C (referral_level 4, B의 하위)
    const B_ids = B.map(u => u.id);
    const C_raw = users.filter(u => u.referral_level === 4 && B_ids.includes(u.referrer_id));
    const C = await Promise.all(C_raw.map(enrichUser));

    // 발기인 S: referral_level === 1이며 referrer_id IS NULL
    const S_raw = users.filter(u => u.referral_level === 1 && u.referrer_id === null);
    const S = await Promise.all(S_raw.map(enrichUser));

    res.json({ success: true, data: { S, A, B, C } });
  } catch (err) {
    console.error("❌ 전체 유저 계층 조회 오류:", err);
    res.status(500).json({ error: "계층 조회 실패" });
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
