const express = require('express');
const db = require('../db');
const router = express.Router();
// 추천 코드 생성 (6자리 16진수)
function generateReferralCode() {
  return [...Array(6)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('')
    .toUpperCase();
}
// 유저 조회 헬퍼
async function findUser(userId) {
  const [rows] = await db.query('SELECT id, referral_code FROM users WHERE id = ?', [userId]);
  return rows[0] || null;
}
router.get('/code-u', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  try {
    const [rows] = await db.query(
      'SELECT referral_code FROM users WHERE id = ?',
      [userId]
    );
    const code = rows[0]?.referral_code || null;
    res.json({ success: true, data: { referral_code: code } });
  } catch (err) {
    console.error('❌ 내 초대 코드 조회 오류:', err);
    res.status(500).json({ success: false, error: '내 초대 코드 조회 실패' });
  }
});
// GET: 특정 유저의 referral_code 조회
// GET /api/referral/code/:id
router.get('/code/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await findUser(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: { referral_code: user.referral_code } });
  } catch (err) {
    console.error('❌ referral_code 조회 오류:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST: referral_code 생성 (존재하지 않을 때)
// POST /api/referral/code/:id
router.post('/code/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await findUser(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    let code = user.referral_code;
    if (!code) {
      code = await generateReferralCode();
      await db.query('UPDATE users SET referral_code = ? WHERE id = ?', [code, userId]);
    }
    res.json({ success: true, data: { referral_code: code } });
  } catch (err) {
    console.error('❌ referral_code 생성 오류:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT: referral_code 업데이트 (관리자 등에서 직접 변경)
// PUT /api/referral/code/:id
// 관리자용: 특정 유저 레퍼럴 코드 업데이트
// PUT /api/referral/users/:id/code
router.put('/users/:id/code', async (req, res) => {
  const userId = req.params.id;
  const { referral_code } = req.body;
  // 유효성 검사: 6자리 16진수
  const pattern = /^[A-F0-9]{6}$/;
  if (!pattern.test(referral_code)) {
    return res.status(400).json({ success: false, error: 'Invalid code format' });
  }
  try {
    const user = await findUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    await db.query(
      'UPDATE users SET referral_code = ? WHERE id = ?',
      [referral_code, userId]
    );
    res.json({ success: true, data: { referral_code } });
  } catch (err) {
    console.error('❌ 관리자용 코드 업데이트 오류:', err);
    res.status(500).json({ success: false, error: '코드 업데이트 실패' });
  }
});

// DELETE: referral_code 삭제 (null 처리)
// DELETE /api/referral/code/:id
router.delete('/code/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await findUser(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    await db.query('UPDATE users SET referral_code = NULL WHERE id = ?', [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ referral_code 삭제 오류:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

  
 // GET / PUT /referral-settings
router.get ('/reward-settings', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM referral_reward_settings LIMIT 1');
  res.json({ success:true, data: rows[0] || {levelA:0,levelB:0,levelC:0} });
});

router.put('/reward-settings', async (req, res) => {
  const { levelA, levelB, levelC } = req.body;
  const [existing] = await db.query('SELECT id FROM referral_reward_settings LIMIT 1');
  if (existing.length) {
    await db.query(
      'UPDATE referral_reward_settings SET levelA=?, levelB=?, levelC=?, updated_at=NOW() WHERE id=?',
      [levelA, levelB, levelC, existing[0].id]
    );
  } else {
    await db.query(
      'INSERT INTO referral_reward_settings(levelA,levelB,levelC) VALUES(?,?,?)',
      [levelA, levelB, levelC]
    );
  }
  res.json({ success:true });
});

// 유틸: 사용자 객체에 team_count, total_profit, last_active 추가
async function enrichUser(user) {
  const [[teamCountRow]] = await db.query(
    `SELECT COUNT(*) AS team_count FROM referral_relations WHERE referrer_id = ? AND status = 'active'`,
    [user.id]
  );
  const [[profitRow]] = await db.query(
    `SELECT IFNULL(SUM(amount), 0) AS total_profit FROM referral_rewards WHERE user_id = ?`,
    [user.id]
  );
  return {
    ...user,
    team_count: Number(teamCountRow.team_count) || 0,
    total_profit: parseFloat(profitRow.total_profit) || 0,
    last_active: user.created_at || new Date().toISOString(),
  };
}

// 보상 설정 조회
// GET /api/referral/reward-settings
router.get('/reward-settings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT levelA, levelB, levelC FROM referral_reward_settings LIMIT 1');
    res.json({ success: true, data: rows[0] || { levelA: 0, levelB: 0, levelC: 0 } });
  } catch (err) {
    console.error('❌ 보상 설정 조회 오류:', err);
    res.status(500).json({ success: false, error: '보상 설정 조회 실패' });
  }
});

// 보상 설정 저장
// PUT /api/referral/reward-settings
router.put('/reward-settings', async (req, res) => {
  const { levelA, levelB, levelC } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM referral_reward_settings LIMIT 1');
    if (existing.length) {
      await db.query(
        'UPDATE referral_reward_settings SET levelA = ?, levelB = ?, levelC = ?, updated_at = NOW() WHERE id = ?',
        [levelA, levelB, levelC, existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO referral_reward_settings(levelA, levelB, levelC) VALUES(?, ?, ?)',
        [levelA, levelB, levelC]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 보상 설정 저장 오류:', err);
    res.status(500).json({ success: false, error: '보상 설정 저장 실패' });
  }
});

// 특정 사용자 추천 네트워크 조회
// GET /api/referral/users/:id/my-team
router.get('/users/:id/my-team', async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.query('SELECT referrer_id FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'User not found' });
    let S = null;
    if (rows[0].referrer_id) {
      const [refRows] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [rows[0].referrer_id]);
      if (refRows.length) S = refRows[0];
    }
    const [Araw] = await db.query(
      'SELECT id, name, email, vip_level, created_at FROM users WHERE referrer_id = ? AND referral_level = 2',
      [userId]
    );
    const A = await Promise.all(Araw.map(enrichUser));
    const A_ids = A.map(u => u.id);
    const [Braw] = A_ids.length
      ? await db.query(
          'SELECT id, name, email, vip_level, created_at FROM users WHERE referrer_id IN (?) AND referral_level = 3',
          [A_ids]
        )
      : [[]];
    const B = await Promise.all(Braw.map(enrichUser));
    const B_ids = B.map(u => u.id);
    const [Craw] = B_ids.length
      ? await db.query(
          'SELECT id, name, email, vip_level, created_at FROM users WHERE referrer_id IN (?) AND referral_level = 4',
          [B_ids]
        )
      : [[]];
    const C = await Promise.all(Craw.map(enrichUser));
    res.json({ success: true, data: { S, A, B, C } });
  } catch (err) {
    console.error('❌ 팀 조회 오류:', err);
    res.status(500).json({ success: false, error: '내 팀 조회 실패' });
  }
});



// 관리자용: 특정 유저 초대 코드 생성/조회
// POST /api/referral/users/:id/invitation-code
router.post('/users/:id/invitation-code', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await findUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    let code = user.referral_code;
    if (!code) {
      // crypto.randomBytes 대신 generateReferralCode 사용
      code = await generateReferralCode();
      await db.query(
        'UPDATE users SET referral_code = ? WHERE id = ?',
        [code, userId]
      );
    }
    res.json({ success: true, data: { referral_code: code } });
  } catch (err) {
    console.error('❌ 관리자용 초대 코드 생성 오류:', err);
    res.status(500).json({ success: false, error: '초대 코드 생성 실패' });
  }
});

// 관리자가 특정 유저의 내 초대 코드 조회
// GET /api/referral/users/:id/code
router.get('/users/:id/code', async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.query(
      'SELECT referral_code FROM users WHERE id = ?',
      [userId]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: { referral_code: rows[0].referral_code || null } });
  } catch (err) {
    console.error('❌ 관리자용 코드 조회 오류:', err);
    res.status(500).json({ success: false, error: '관리자용 코드 조회 실패' });
  }
});

// 관리자가 특정 유저의 초대 코드 생성/재생성
// POST /api/referral/users/:id/code
router.post('/users/:id/code', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await findUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    let code = user.referral_code;
    if (!code) {
      // crypto.randomBytes 대신 generateReferralCode 사용
      code = await generateReferralCode();
      await db.query(
        'UPDATE users SET referral_code = ? WHERE id = ?',
        [code, userId]
      );
    }
    res.json({ success: true, data: { referral_code: code } });
  } catch (err) {
    console.error('❌ 관리자용 초대 코드 생성 오류:', err);
    res.status(500).json({ success: false, error: '초대 코드 생성 실패' });
  }
});

// 관리자가 특정 유저의 초대 현황 조회
// GET /api/referral/users/:id/invitation-status
router.get('/users/:id/invitation-status', async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.query(
      'SELECT referral_code FROM users WHERE id = ?',
      [userId]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const code = rows[0].referral_code;
    const [invites] = await db.query(
      'SELECT id, name, email, created_at AS invited_at FROM users WHERE referrer_id = ?',
      [userId]
    );
    res.json({ success: true, data: { referral_code: code, total_invites: invites.length, invites } });
  } catch (err) {
    console.error('❌ 관리자용 초대 현황 조회 오류:', err);
    res.status(500).json({ success: false, error: '관리자용 초대 현황 조회 실패' });
  }
});

// 모든 사용자에 대한 레퍼럴 네트워크 조회
// GET /api/referral/users/all/my-teams
router.get('/users/all/my-teams', async (req, res) => {
  try {
    const [userIds] = await db.query('SELECT id FROM users');
    const results = await Promise.all(userIds.map(async ({ id }) => {
      const [[meRow]] = await db.query(
        'SELECT id,name,email,vip_level,created_at FROM users WHERE id = ?',
        [id]
      );
      const S = await enrichUser(meRow);

      const [Araw] = await db.query(
        'SELECT id,name,email,vip_level,created_at FROM users WHERE referrer_id = ? AND referral_level = 2',
        [id]
      );
      const A = await Promise.all(Araw.map(enrichUser));
      const A_ids = A.map(u => u.id);

      const [Braw] = A_ids.length
        ? await db.query(
            'SELECT id,name,email,vip_level,created_at FROM users WHERE referrer_id IN (?) AND referral_level = 3',
            [A_ids]
          )
        : [[]];
      const B = await Promise.all(Braw.map(enrichUser));
      const B_ids = B.map(u => u.id);

      const [Craw] = B_ids.length
        ? await db.query(
            'SELECT id,name,email,vip_level,created_at FROM users WHERE referrer_id IN (?) AND referral_level = 4',
            [B_ids]
          )
        : [[]];
      const C = await Promise.all(Craw.map(enrichUser));

      return { S, A, B, C };
    }));
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('❌ 전체 팀 조회 오류:', err);
    res.status(500).json({ success: false, error: '전체 팀 조회 실패' });
  }
});
// ✅ 전체 유저 목록 기반으로 팀 구성 조회 + 계층 분리

// 📁 routes/referral.js (또는 wallet.js) 의 /my-team 핸들러
router.get('/my-team', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ success:false, error:'Unauthorized' });

  const enrichUser = async (u) => {
    const [[{ team_count }]] = await db.query(
      `SELECT COUNT(*) AS team_count 
       FROM referral_relations 
       WHERE referrer_id=? AND status='active'`, [u.id]);
    const [[{ total_profit }]] = await db.query(
      `SELECT IFNULL(SUM(amount),0) AS total_profit
       FROM referral_rewards 
       WHERE user_id=?`, [u.id]);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      vip_level: u.vip_level,
      created_at: u.created_at,
      team_count: Number(team_count) || 0,
      total_profit: parseFloat(total_profit) || 0,    // ← 문자열 → 숫자
      last_active: u.created_at
    };
  };

  // S: 로그인 유저 자신
  const [[me]] = await db.query(
    `SELECT id,name,email,vip_level,created_at FROM users WHERE id=?`, [userId]
  );
  const S = [await enrichUser(me)];

  // A단계: level = 2
  const [aRels] = await db.query(
    `SELECT referred_id FROM referral_relations
     WHERE referrer_id=? AND level=2 AND status='active'`, [userId]
  );
  const A_ids = aRels.map(r=>r.referred_id);
  const A = A_ids.length
    ? await Promise.all(
        (await db.query(
            `SELECT id,name,email,vip_level,created_at FROM users
             WHERE id IN (?)`, [A_ids]
         ))[0].map(enrichUser)
      )
    : [];

  // B단계: level = 3
  const [bRels] = A_ids.length
    ? await db.query(
        `SELECT referred_id FROM referral_relations
         WHERE referrer_id IN (?) AND level=3 AND status='active'`, [A_ids]
      )
    : [[]];
  const B_ids = (bRels[0]||[]).map(r=>r.referred_id);
  const B = B_ids.length
    ? await Promise.all(
        (await db.query(
           `SELECT id,name,email,vip_level,created_at FROM users
            WHERE id IN (?)`, [B_ids]
         ))[0].map(enrichUser)
      )
    : [];

  // C단계: level = 4
  const [cRels] = B_ids.length
    ? await db.query(
        `SELECT referred_id FROM referral_relations
         WHERE referrer_id IN (?) AND level=4 AND status='active'`, [B_ids]
      )
    : [[]];
  const C_ids = (cRels[0]||[]).map(r=>r.referred_id);
  const C = C_ids.length
    ? await Promise.all(
        (await db.query(
           `SELECT id,name,email,vip_level,created_at FROM users
            WHERE id IN (?)`, [C_ids]
         ))[0].map(enrichUser)
      )
    : [];

  res.json({ success: true, data:{ S, A, B, C } });
});
router.get('/admin/my-team', async (req, res) => {
  try {
    // 사용자 보강 함수
    const enrichUser = async (u) => {
      const [[{ team_count }]] = await db.query(
        `SELECT COUNT(*) AS team_count
         FROM referral_relations
         WHERE referrer_id = ? AND status='active'`,
        [u.id]
      );
      const [[{ total_profit }]] = await db.query(
        `SELECT IFNULL(SUM(amount),0) AS total_profit
         FROM referral_rewards
         WHERE user_id = ?`,
        [u.id]
      );
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        vip_level: u.vip_level,
        created_at: u.created_at,
        team_count: Number(team_count),
        total_profit: parseFloat(total_profit),
        last_active: u.created_at
      };
    };

    // S 단계: referral_level = 1
    const [sUsers] = await db.query(`
      SELECT id,name,email,vip_level,created_at
      FROM users
      WHERE referral_level = 1
    `);
    const S = await Promise.all(sUsers.map(enrichUser));

    // A 단계: level = 2
    const [aRels] = await db.query(`
      SELECT referred_id
      FROM referral_relations
      WHERE level = 2 AND status='active'
    `);
    const A_ids = aRels.map(r => r.referred_id);
    const A = A_ids.length
      ? await Promise.all(
          (await db.query(
            `SELECT id,name,email,vip_level,created_at
             FROM users
             WHERE id IN (?)`, [A_ids]
          ))[0].map(enrichUser)
        )
      : [];

    // B 단계: level = 3
    const [bRels] = await db.query(`
      SELECT referred_id
      FROM referral_relations
      WHERE level = 3 AND status='active'
    `);
    const B_ids = bRels.map(r => r.referred_id);
    const B = B_ids.length
      ? await Promise.all(
          (await db.query(
            `SELECT id,name,email,vip_level,created_at
             FROM users
             WHERE id IN (?)`, [B_ids]
          ))[0].map(enrichUser)
        )
      : [];

    // C 단계: level = 4
    const [cRels] = await db.query(`
      SELECT referred_id
      FROM referral_relations
      WHERE level = 4 AND status='active'
    `);
    const C_ids = cRels.map(r => r.referred_id);
    const C = C_ids.length
      ? await Promise.all(
          (await db.query(
            `SELECT id,name,email,vip_level,created_at
             FROM users
             WHERE id IN (?)`, [C_ids]
          ))[0].map(enrichUser)
        )
      : [];

    res.json({ success: true, data: { S, A, B, C } });
  } catch (err) {
    console.error('❌ 관리자용 팀 조회 오류:', err);
    res.status(500).json({ success: false, error: 'Admin team fetch failed' });
  }
});

  // 📁 routes/referral.js
router.get('/stats', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
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
