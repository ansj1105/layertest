const express = require('express');
const router = express.Router();
const TronWeb = require('tronweb');
const axios = require('axios');
const db = require('../db');
require('dotenv').config();
const { getTronWeb, USDT_CONTRACT } = require("../utils/tron");

// ▶ 1. 지갑 생성
// GET /api/tron/create-wallet
router.get('/create-wallet', async (req, res) => {
  try {
    const tronWeb = getTronWeb();
    const account = await tronWeb.createAccount();
    // 로그만 남기고 실제 저장은 필요에 따라 변경하세요
    await db.query(
      'INSERT INTO wallet_log (address, private_key) VALUES (?, ?)',
      [account.address.base58, account.privateKey]
    );
    res.json({ success: true, address: account.address.base58, privateKey: account.privateKey });
  } catch (err) {
    console.error('❌ 지갑 생성 실패:', err);
    res.status(500).json({ success: false, error: 'Wallet creation failed' });
  }
});
// 📁 routes/tron.js (기존 파일에 이어 붙이세요)
router.get('/create-wallet/logs', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, address, private_key, created_at
         FROM wallet_log
       ORDER BY created_at DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('❌ /create-wallet/logs 조회 실패:', err);
    res.status(500).json({ error: 'Failed to fetch wallet logs' });
  }
});

// ▶ 2. 잔액 조회 (Tronscan API 활용)
// GET /api/tron/balance?address=...
router.get('/balance', async (req, res) => {
  const address = (req.query.address || '').trim();
  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
    return res.status(400).json({ success: false, error: 'Invalid TRON address' });
  }
  try {
    const response = await axios.get('https://apilist.tronscanapi.com/api/accountv2', {
      params: { address },
      headers: { 'TRON-PRO-API-KEY': process.env.TRON_API_KEY2 }
    });
    const usdtAsset = response.data.withPriceTokens?.find(
      t => t.tokenId === USDT_CONTRACT
    );
    const usdt = usdtAsset ? Number(usdtAsset.balance) / 1e6 : 0;
    // 옵션: 잔액 기록
    await db.query('INSERT INTO balance_log (address, balance_usdt) VALUES (?, ?)', [
      address, usdt
    ]);
    res.json({ success: true, usdt: usdt.toFixed(6) });
  } catch (err) {
    console.error('❌ 잔액 조회 실패:', err.message);
    res.status(500).json({ success: false, error: 'Balance check failed' });
  }
});


/**
 * ▶ TRX 잔액 조회
 * GET /api/tron/balance-trx?address=<TRON 주소>
 */
router.get('/balance-trx', async (req, res) => {
  const address = (req.query.address || '').trim();
  // 간단한 형식 검사
  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
    return res.status(400).json({ success: false, error: 'Invalid TRON address' });
  }

  try {
    const tronWeb = getTronWeb();
    // Sun 단위로 잔액 조회
    const sunBalance = await tronWeb.trx.getBalance(address);
    // TRX 로 변환
    const trxBalance = tronWeb.fromSun(sunBalance);

    // (선택) DB에 기록
    await db.query(
      `INSERT INTO balance_log 
         (address, balance_usdt, balance_trx, created_at)
       VALUES (?, NULL, ?, NOW())`,
      [address, trxBalance]
    );

    return res.json({ success: true, trx: Number(trxBalance).toFixed(6) });
  } catch (err) {
    console.error('❌ TRX 잔액 조회 실패:', err.message);
    return res.status(500).json({ success: false, error: 'TRX balance check failed' });
  }
});
// 📁 routes/tron.js (기존 파일에 이어 붙이세요)
router.post('/send-trx', async (req, res) => {
  const { fromPrivateKey, toAddress, amount } = req.body;
  if (!fromPrivateKey || !toAddress || !amount) {
    return res.status(400).json({ success: false, error: 'Missing parameters' });
  }

  try {
    const tronWeb = getTronWeb(fromPrivateKey);
    // 주소 유효성 검사
    if (!tronWeb.isAddress(toAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid toAddress' });
    }
    const fromAddress = tronWeb.address.fromPrivateKey(fromPrivateKey);
    // Sun 단위로 변환 (1 TRX = 10^6 Sun)
    const sunAmount = tronWeb.toSun(amount);

    // 1) 트랜잭션 생성 및 전송
    const tx = await tronWeb.trx.sendTransaction(
      toAddress,
      sunAmount,
      fromPrivateKey
    );
    if (tx.result !== true && !tx.txid) {
      throw new Error(`Send failed: ${JSON.stringify(tx)}`);
    }
    const txHash = tx.txid || tx;

    // 2) DB에 기록
    await db.query(
      `INSERT INTO transaction_log
         (from_address, to_address, amount_usdt, amount_trx, tx_hash, status, created_at)
       VALUES (?, ?, NULL, ?, ?, 'SUCCESS', NOW())`,
      [fromAddress, toAddress, amount, txHash]
    );

    res.json({ success: true, txHash });
  } catch (err) {
    console.error('❌ TRX 송금 실패:', err.message);
    // 실패 로그
    try {
      await db.query(
        `INSERT INTO transaction_log
           (from_address, to_address, amount_usdt, amount_trx, status, reason, created_at)
         VALUES (?, ?, NULL, ?, 'FAILED', ?, NOW())`,
        ['unknown', req.body.toAddress, req.body.amount, err.message]
      );
    } catch (logErr) {
      console.error('❌ 실패 로그 기록 오류:', logErr);
    }
    res.status(500).json({ success: false, error: 'TRX transfer failed' });
  }
});

// ▶ 3. USDT 송금
// POST /api/tron/send
// body: { fromPrivateKey, toAddress, amount }
router.post('/send', async (req, res) => {
  const { fromPrivateKey, toAddress, amount } = req.body;
  if (!fromPrivateKey || !toAddress || !amount) {
    return res.status(400).json({ success: false, error: 'Missing parameters' });
  }
  try {
    const tronWeb = getTronWeb(fromPrivateKey);
    if (!tronWeb.isAddress(toAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid toAddress' });
    }
    const contract = await tronWeb.contract().at(USDT_CONTRACT);
    const tx = await contract.methods.transfer(toAddress, Math.floor(amount * 1e6)).send();
    const fromAddress = tronWeb.address.fromPrivateKey(fromPrivateKey);
    // DB에 기록
    await db.query(
      'INSERT INTO transaction_log (from_address, to_address, amount_usdt, tx_hash, status) VALUES (?, ?, ?, ?, ?)',
      [fromAddress, toAddress, amount, tx, 'SUCCESS']
    );
    res.json({ success: true, txHash: tx });
  } catch (err) {
    console.error('❌ 송금 실패:', err.message);
    // 실패 로그
    await db.query(
      'INSERT INTO transaction_log (from_address, to_address, amount_usdt, status, reason) VALUES (?, ?, ?, ?, ?)',
      ['unknown', req.body.toAddress, req.body.amount, 'FAILED', err.message]
    );
    res.status(500).json({ success: false, error: 'Transfer failed' });
  }
});

// ▶ 4. 트랜잭션 로그 조회
// GET /api/tron/transactions
router.get('/transactions', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM transaction_log ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('❌ 트랜잭션 로그 조회 실패:', err);
    res.status(500).json({ success: false, error: 'Fetch transactions failed' });
  }
});

async function getTronBalance(address) {
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
      throw new Error('Invalid TRON address');
    }
    const response = await axios.get('https://apilist.tronscanapi.com/api/accountv2', {
      params: { address },
      headers: { 'TRON-PRO-API-KEY': process.env.TRON_API_KEY2 }
    });
    const usdtAsset = response.data.withPriceTokens?.find(t => t.tokenId === USDT_CONTRACT);
    return usdtAsset ? Number(usdtAsset.balance) / 1e6 : 0;
  }

// ▶ 5. 자금 회수 (real_amount ≥ threshold 인 지갑)
router.post('/reclaim-funds', async (_req, res) => {
  try {
    // 1) 회수 기준 및 관리자 지갑 조회
    const [[setting]] = await db.query(
      'SELECT threshold, admin_address, admin_private_key FROM reclaim_settings ORDER BY id DESC LIMIT 1'
    );
    const threshold = Number(setting.threshold);
    const adminAddr = setting.admin_address;
    const adminKey  = setting.admin_private_key;

    // 2) 회수 대상 지갑 조회
    const [targets] = await db.query(
      'SELECT id, user_id, address, private_key, real_amount FROM wallets WHERE real_amount >= ?',
      [threshold]
    );

    const results = [];

    for (const w of targets) {
      try {
        // 3) 트랜잭션 실행: w.private_key → adminAddr 로 회수
        const tronWeb = getTronWeb(w.private_key);
        const sunAmount = tronWeb.toSun(w.real_amount);
        const tx = await tronWeb.trx.sendTransaction(adminAddr, sunAmount, w.private_key);
        const txHash = tx.txid || (tx.result === true && tx.txid);
        if (!txHash) throw new Error(`Send failed: ${JSON.stringify(tx)}`);

        // 4) wallets 업데이트
        await db.query(
          'UPDATE wallets SET real_amount = 0, updated_at = NOW() WHERE id = ?',
          [w.id]
        );

        // 5) wallets_log 기록
        await db.query(
          `INSERT INTO wallets_log
             (user_id, category, log_date, direction, amount, balance_after,
              reference_type, reference_id, description, created_at)
           VALUES (?, 'reclaim', NOW(), 'out', ?, 0, 'reclaim', ?, ?, NOW())`,
          [w.user_id, w.real_amount, w.id, `Reclaimed ${w.real_amount} from ${w.address}`]
        );

        // 6) transaction_log 기록 (선택)
        await db.query(
          `INSERT INTO transaction_log
             (from_address, to_address, amount_usdt, amount_trx, tx_hash, status, created_at)
           VALUES (?, ?, NULL, ?, ?, 'SUCCESS', NOW())`,
          [w.address, adminAddr, w.real_amount, txHash]
        );

        results.push({ wallet_id: w.id, txHash, status: 'success' });
      } catch (err) {
        console.error(`❌ Reclaim failed for wallet ${w.id}:`, err.message);
        results.push({ wallet_id: w.id, status: 'failed', error: err.message });
      }
    }

    return res.json({ success: true, threshold, adminAddr, results });
  } catch (err) {
    console.error('❌ /reclaim-funds error:', err);
    return res.status(500).json({ success: false, error: 'Reclaim process failed' });
  }
});
// routes/tron.js 에 추가
// routes/tron.js

// ▶ 관리자→지갑 TRX 충전 (reclaim_settings 기준으로)
router.post('/fund-wallet', async (req, res) => {
  const { toAddress, amount } = req.body;
  if (!toAddress || !amount) {
    return res.status(400).json({ success: false, error: 'Missing parameters' });
  }

  try {
    // 1) reclaim_settings 에서 admin 주소/키 조회
    const [[setting]] = await db.query(
      'SELECT admin_address, admin_private_key FROM reclaim_settings ORDER BY id DESC LIMIT 1'
    );
    const adminAddr = setting.admin_address;
    const adminKey  = setting.admin_private_key;

    // 2) 주소 유효성 검사
    const tronWeb = getTronWeb(adminKey);
    if (!tronWeb.isAddress(toAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid toAddress' });
    }

    // 3) 전송
    const sunAmount = tronWeb.toSun(amount);
    const tx = await tronWeb.trx.sendTransaction(toAddress, sunAmount, adminKey);
    const txHash = tx.txid || (tx.result === true && tx.txid);
    if (!txHash) throw new Error('Transfer failed');

    // 4) transaction_log 기록
    await db.query(
      `INSERT INTO transaction_log
         (from_address, to_address, amount_usdt, amount_trx, tx_hash, status, created_at)
       VALUES (?, ?, NULL, ?, ?, 'SUCCESS', NOW())`,
      [ adminAddr, toAddress, amount, txHash ]
    );

    return res.json({ success: true, txHash });
  } catch (err) {
    console.error('❌ 관리자 충전 실패:', err.message);
    return res.status(500).json({ success: false, error: 'Funding failed' });
  }
});



module.exports = {
    router,
    getTronBalance
  };