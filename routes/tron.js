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

module.exports = {
    router,
    getTronBalance
  };