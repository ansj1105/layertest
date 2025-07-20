// 📁 routes/recharge.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// ───────────────────────────────────────────────────────────────────────
// ── BNB 충전 정보 조회 ───────────────────────────────────
// GET /api/recharge/bnb
router.get('/bnb', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    // wallets 테이블에 user_id 외래키로 주소 저장돼 있다고 가정
    const [[wallet]] = await db.query(
      'SELECT address FROM bnb_log WHERE user_id = ?',
      [userId]
    );

    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    // 프론트에서 체인명, 주소, QR 데이터로 쓸 수 있게 돌려줍니다 
    res.json({
      success: true,
      data: {
        chain: 'BEP-20',
        address: wallet.address
      }
    });
  } catch (err) {
    console.error('❌ Recharge fetch error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── USDT 충전 정보 조회 ───────────────────────────────────
// GET /api/recharge/usdt
router.get('/usdt', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    // wallets 테이블에 user_id 외래키로 주소 저장돼 있다고 가정
    const [[wallet]] = await db.query(
      'SELECT address FROM wallets WHERE user_id = ?',
      [userId]
    );

    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    // 프론트에서 체인명, 주소, QR 데이터로 쓸 수 있게 돌려줍니다
    res.json({
      success: true,
      data: {
        chain: 'TRC-20',
        address: wallet.address
      }
    });
  } catch (err) {
    console.error('❌ Recharge fetch error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
