// 📁 routes/withdrawals.js

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const axios   = require('axios');
const { getTronBalance } = require('../routes/tron');
const USDT_CONTRACT = process.env.USDT_CONTRACT;

// polling intervals
const DEPOSIT_POLL_INTERVAL    = 2 * 60 * 1000;   // 2분
const REAL_AMOUNT_INTERVAL     = 2 * 60 * 60 * 1000; // 2시간
const MAX_DEPOSIT_RETRIES      = 10;

// 전체 지갑 목록 조회
// GET /api/withdrawals/wallets
// 📁 routes/withdrawals.js (또는 해당 라우터 파일)
router.get('/wallets', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        w.id            AS wallet_id,
        w.user_id       AS user_id,
        u.name          AS user_name,
        u.email         AS user_email,
        w.address,
        w.quant_balance,
        w.fund_balance,
        w.real_amount,
        w.updated_at
      FROM wallets w
      JOIN users u
        ON w.user_id = u.id
      ORDER BY w.updated_at DESC
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('❌ /withdrawals/wallets 조회 실패:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch wallets' });
  }
});

// 📁 routes/withdrawals.js
// 📁 routes/withdrawals.js
// 📁 routes/withdrawals.js
router.post('/wallets/:id/deposit', async (req, res) => {
  const walletId = req.params.id;
  const { type, amount } = req.body;

  if (!['fund', 'quant'].includes(type) || isNaN(amount)) {
    return res.status(400).json({ success: false, error: 'Invalid type or amount' });
  }

  try {
    // 1) 지갑 조회
    const [[wallet]] = await db.query(
      `SELECT * FROM wallets WHERE id = ?`,
      [walletId]
    );
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    // 2) 새 잔액 계산
    const prevFund  = parseFloat(wallet.fund_balance);
    const prevQuant = parseFloat(wallet.quant_balance);
    const amt       = parseFloat(amount);

    const newFund  = type === 'fund'  ? prevFund  + amt : prevFund;
    const newQuant = type === 'quant' ? prevQuant + amt : prevQuant;

    // 3) 지갑 테이블 업데이트
    await db.query(
      `UPDATE wallets 
         SET fund_balance  = ?, 
             quant_balance = ?, 
             updated_at     = NOW() 
       WHERE id = ?`,
      [ newFund.toFixed(6), newQuant.toFixed(6), walletId ]
    );

    // 4) wallets_log 에 로그 삽입
    const category      = type === 'fund' ? 'funding' : 'quant';
    const balanceAfter  = type === 'fund' ? newFund : newQuant;
    await db.query(
      `INSERT INTO wallets_log
         (user_id, category, log_date, direction, amount, balance_after,
          reference_type, reference_id, description, created_at, updated_at)
       VALUES
         (?,       ?,        NOW(),     'in',      ?,      ?,             ?,            ?,            ?,           NOW(),      NOW())`,
      [
        wallet.user_id,
        category,
        amt.toFixed(6),
        balanceAfter.toFixed(6),
        'admin_deposit',    // reference_type
        walletId,           // reference_id
        '관리자 수동 입금'     // description
      ]
    );

    // 5) 결과 반환
    return res.json({
      success: true,
      data: {
        wallet_id:     walletId,
        fund_balance:  newFund.toFixed(6),
        quant_balance: newQuant.toFixed(6),
      }
    });
  } catch (err) {
    console.error('❌ 입금 처리 오류:', err);
    return res.status(500).json({ success: false, error: 'Deposit failed' });
  }
});




// ── 2) PENDING 입금 처리 스케줄러용 함수 ─────────────────────────────────────────
async function processPendingDeposits() {
  try {
    const [rows] = await db.query(
      `SELECT id, to_address AS address, initial_balance, retry_count
       FROM withdrawals
       WHERE flow_type='DEPOSIT' AND status='PENDING'`
    );

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
        await db.query(
          `UPDATE withdrawals
             SET amount = ?, status='SUCCESS', updated_at=NOW()
           WHERE id = ?`,
          [diff, w.id]
        );
        await db.query(
          `UPDATE wallets
             SET fund_balance = fund_balance + ?, updated_at = NOW()
           WHERE address = ?`,
          [diff, w.address]
        );
        console.log(`✅ [Deposit#${w.id}] +${diff} USDT 입금 완료`);
      } else {
        const tries = w.retry_count + 1;
        if (tries >= MAX_DEPOSIT_RETRIES) {
          await db.query(
            `UPDATE withdrawals
               SET status='FAILED', reason='잔액 변동 없음', retry_count=?, updated_at=NOW()
             WHERE id = ?`,
            [tries, w.id]
          );
          console.warn(`⚠️ [Deposit#${w.id}] 최대 재시도 초과, FAILED 처리`);
        } else {
          await db.query(
            `UPDATE withdrawals
               SET retry_count = ?
             WHERE id = ?`,
            [tries, w.id]
          );
          console.log(`🔄 [Deposit#${w.id}] 아직 입금 전, 재시도 ${tries}`);
        }
      }
    }
  } catch (err) {
    console.error('❌ processPendingDeposits 전체 실패:', err);
  }
}

// ── 3) real_amount 동기화 함수 (전체) ────────────────────────────────────────
async function updateAllRealAmounts() {
  try {
    const [wallets] = await db.query(
      'SELECT id, address, user_id FROM wallets WHERE address IS NOT NULL'
    );
    console.log('📝 updateAllRealAmounts - wallets to update:', wallets);
    const results = [];
    for (const w of wallets) {
      const result = await updateRealAmountFor(w.id, w.address, w.user_id);
      results.push(result);
    }
    return results;
  } catch (err) {
    console.error('❌ updateAllRealAmounts 실패:', err);
    throw err;
  }
}

// ── 공통: 단일 지갑 real_amount 업데이트 헬퍼 ─────────────────────────────────
async function updateRealAmountFor(id, address, userId) {
  // 이전 real_amount 조회
  const [[prevRow]] = await db.query(
    'SELECT real_amount FROM wallets WHERE id = ?', [id]
  );
  const prevAmt = prevRow && prevRow.real_amount ? Number(prevRow.real_amount) : 0;

  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
    return { id, address, error: 'Invalid address' };
  }

  // TRON 잔액 조회
  const apiRes = await axios.get(
    'https://apilist.tronscanapi.com/api/accountv2',
    { params: { address }, headers: { 'TRON-PRO-API-KEY': process.env.TRON_API_KEY2 } }
  );
  const usdtAsset = apiRes.data.withPriceTokens?.find(t => t.tokenId === USDT_CONTRACT);
  const usdt = usdtAsset ? Number(usdtAsset.balance) / 1e6 : 0;
  console.log(`🔍 updateRealAmountFor walletId=${id}, address=${address}, prevAmt=${prevAmt}, fetched=${usdt}`);
  // 차이(diff) 계산 및 업데이트
  const diff = +(usdt - prevAmt).toFixed(6);
  await db.query(
    'UPDATE wallets SET real_amount = ?, updated_at = NOW() WHERE id = ?',
    [usdt.toFixed(6), id]
  );
   // 2) real_amount가 증가했으면 fund_balance에도 동일 금액만큼 추가
 if (diff > 0) {
   await db.query(
     'UPDATE wallets SET fund_balance = fund_balance + ? WHERE id = ?',
     [diff, id]
   );
 }

  await db.query(
    'INSERT INTO balance_log (address, balance_usdt) VALUES (?, ?)',
    [address, usdt.toFixed(6)]
  );

  // 변화가 있으면 withdrawals에 기록
  if (diff !== 0) {
    const flowType = diff > 0 ? 'DEPOSIT' : 'WITHDRAWAL';
    const amount   = Math.abs(diff);
    await db.query(
      `INSERT INTO withdrawals
         (user_id, amount, to_address, method, status, flow_type,
          initial_balance, retry_count, created_at)
       VALUES (?, ?, ?, 'TRC-20', 'SUCCESS', ?, ?, 0, NOW())`,
      [userId, amount, address, flowType, prevAmt]
    );
    const balanceSql = diff > 0
      ? 'UPDATE wallets SET fund_balance = fund_balance + ?, updated_at = NOW() WHERE id = ?'
      : 'UPDATE wallets SET fund_balance = fund_balance - ?, updated_at = NOW() WHERE id = ?';
    await db.query(balanceSql, [amount, id]);
  }

  return { id, address, real_amount: usdt.toFixed(6), diff };
}
// ▶ API: 전체 지갑 real_amount 조회/업데이트
router.get('/real-amount/all', async (_req, res) => {
  try {
    const results = await updateAllRealAmounts();
    return res.json({ success: true, results });
  } catch (err) {
    console.error('❌ /real-amount/all 실패:', err);
    return res.status(500).json({ success: false, error: 'Failed to update all real_amounts' });
  }
});
// ▶ API: 단일 지갑 real_amount 조회/업데이트
router.get('/real-amount/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [[wallet]] = await db.query(
      'SELECT id, address FROM wallets WHERE id = ?', [id]
    );
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }
    const result = await updateRealAmountFor(wallet.id, wallet.address, wallet.user_id);
    return res.json({ success: true, result });
  } catch (err) {
    console.error('❌ /real-amount/:id 실패:', err);
    return res.status(500).json({ success: false, error: 'Failed to update real_amount' });
  }
});



// ▶ 서버 시작 시 즉시 실행 및 스케줄러 등록
processPendingDeposits();
//updateAllRealAmounts();
setInterval(processPendingDeposits, DEPOSIT_POLL_INTERVAL);
setInterval(updateAllRealAmounts, REAL_AMOUNT_INTERVAL);

// ▶ 기존 스케줄러

// ▶ 서버 시작 시 즉시 실행 및 스케줄러 등록
//processRealAmounts();


module.exports = router;