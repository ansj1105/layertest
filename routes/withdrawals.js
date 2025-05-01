// 📁 routes/withdrawals.js

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { getTronBalance } = require('../routes/tron');

const POLL_INTERVAL = 2 * 60 * 1000;  // 2분
const MAX_RETRIES   = 10;

// ── 1) 사용자 입금 요청 (USDT) ─────────────────────────────────────────────────────
// POST /api/withdrawals/deposit
router.post('/deposit', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. 지갑 조회
    const [[wallet]] = await db.query(
      'SELECT address, fund_balance FROM wallets WHERE user_id = ?',
      [userId]
    );
    if (!wallet) {
      return res.status(400).json({ error: '지갑이 없습니다. 먼저 지갑을 생성해 주세요.' });
    }

    // 2. PENDING 상태로 입금 레코드 생성
    await db.query(
      `INSERT INTO withdrawals
         (user_id, to_address, method, status, flow_type, initial_balance, created_at)
       VALUES (?, ?, 'TRC-20', 'PENDING', 'DEPOSIT', ?, NOW())`,
      [userId, wallet.address, wallet.fund_balance]
    );

    res.json({ success: true, data: { address: wallet.address } });
  } catch (err) {
    console.error('❌ 입금 요청 오류:', err);
    res.status(500).json({ error: '입금 요청 실패' });
  }
});

// ── 2) 스케줄러용 함수 ──────────────────────────────────────────────────────────
async function processPendingDeposits() {
  const [rows] = await db.query(`
    SELECT id, to_address AS address, initial_balance, retry_count
    FROM withdrawals
    WHERE flow_type='DEPOSIT' AND status='PENDING'
  `);

  for (const w of rows) {
    let current;
    try {
      current = await getTronBalance(w.address);
    } catch (err) {
      console.error(`❌ [Deposit#${w.id}] Tronscan 조회 실패:`, err.message);
      continue;
    }

    if (current > w.initial_balance) {
      const diff = +(current - w.initial_balance).toFixed(6);
      // 1) 성공 처리
      await db.query(`
        UPDATE withdrawals
        SET amount = ?, status='SUCCESS', updated_at=NOW()
        WHERE id = ?
      `, [diff, w.id]);
      // 2) 지갑 fund_balance 갱신
      await db.query(`
        UPDATE wallets
        SET fund_balance = fund_balance + ?
        WHERE address = ?
      `, [diff, w.address]);
      console.log(`✅ [Deposit#${w.id}] +${diff} USDT 입금 완료`);
    } else {
      const tries = w.retry_count + 1;
      if (tries >= MAX_RETRIES) {
        // 실패 처리
        await db.query(`
          UPDATE withdrawals
          SET status='FAILED', reason='잔액 변동 없음', retry_count=?, updated_at=NOW()
          WHERE id = ?
        `, [tries, w.id]);
        console.warn(`⚠️ [Deposit#${w.id}] 최대 재시도 초과, FAILED 처리`);
      } else {
        // 재시도 카운트만 증가
        await db.query(`
          UPDATE withdrawals
          SET retry_count = ?
          WHERE id = ?
        `, [tries, w.id]);
        console.log(`🔄 [Deposit#${w.id}] 아직 입금 전, 재시도 ${tries}`);
      }
    }
  }
}

// 서버가 시작될 때와 2분마다 스케줄러 실행
processPendingDeposits();
setInterval(processPendingDeposits, POLL_INTERVAL);

module.exports = router;
