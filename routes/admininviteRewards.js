const express = require('express');
const router  = express.Router();
const db = require('../db');



// ▶ 전체 목록 조회
// GET /api/admin/invite-rewards
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, referral_level, required_referrals, reward_amount
      FROM invite_rewards
      ORDER BY referral_level, required_referrals
    `);
    res.json({ success:true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, error:'조회 실패' });
  }
});

// ▶ 신규 설정 추가
// POST /api/admin/invite-rewards
// body: { referral_level, required_referrals, reward_amount }
router.post('/', async (req, res) => {
  const { referral_level, required_referrals, reward_amount } = req.body;
  try {
    const [result] = await db.query(`
      INSERT INTO invite_rewards (referral_level, required_referrals, reward_amount)
      VALUES (?, ?, ?)
    `, [referral_level, required_referrals, reward_amount]);
    res.json({ success:true, data: { id: result.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, error:'생성 실패' });
  }
});

// ▶ 설정 수정
// PUT /api/admin/invite-rewards/:id
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { referral_level, required_referrals, reward_amount } = req.body;
  try {
    await db.query(`
      UPDATE invite_rewards
      SET referral_level=?, required_referrals=?, reward_amount=?
      WHERE id=?
    `, [referral_level, required_referrals, reward_amount, id]);
    res.json({ success:true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, error:'수정 실패' });
  }
});

// ▶ 설정 삭제
// DELETE /api/admin/invite-rewards/:id
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await db.query(`DELETE FROM invite_rewards WHERE id=?`, [id]);
    res.json({ success:true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, error:'삭제 실패' });
  }
});

module.exports = router;
