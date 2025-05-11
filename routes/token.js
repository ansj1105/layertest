// 📁 routes/token.js
const express = require("express");
const router = express.Router();
const db = require("../db");


// 🔐 관리자 권한 검증 미들웨어 필요 시 추가 가능

// -------------------
// 3.1 토큰 관리 (관리자용)
// -------------------
router.post("/tokens", async (req, res) => {
  const { name, symbol, description, totalSupply, decimals = 18 } = req.body;
  try {
    const id = uuidv4();
    await db.query(
      "INSERT INTO tokens (id, name, symbol, description, total_supply, decimals) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, symbol, description, totalSupply, decimals]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: "토큰 생성 실패", details: err.message });
  }
});

router.get("/tokens", async (_, res) => {
  const [tokens] = await db.query("SELECT * FROM tokens");
  res.json(tokens);
});

router.get("/tokens/:id", async (req, res) => {
  const [token] = await db.query("SELECT * FROM tokens WHERE id = ?", [req.params.id]);
  res.json(token[0]);
});

router.patch("/tokens/:id", async (req, res) => {
  const { name, symbol, description } = req.body;
  await db.query(
    "UPDATE tokens SET name = ?, symbol = ?, description = ? WHERE id = ?",
    [name, symbol, description, req.params.id]
  );
  res.json({ success: true });
});

router.delete("/tokens/:id", async (req, res) => {
  await db.query("DELETE FROM tokens WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// ------------------------
// 3.2 프리세일 관리 (관리자용)
// ------------------------
router.post("/token-sales", async (req, res) => {
  const id = uuidv4();
  const {
    tokenId, name, totalSupply, price,
    feeRate = 12, startTime, endTime,
    minimumPurchase = 10, maximumPurchase,
    lockupPeriod
  } = req.body;
  await db.query(
    `INSERT INTO token_sales (id, token_id, name, total_supply, remaining_supply, price, fee_rate,
      start_time, end_time, minimum_purchase, maximum_purchase, lockup_period)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, tokenId, name, totalSupply, totalSupply, price, feeRate, startTime, endTime, minimumPurchase, maximumPurchase, lockupPeriod]
  );
  res.json({ success: true, id });
});

router.get("/token-sales", async (_, res) => {
  const [sales] = await db.query("SELECT * FROM token_sales");
  res.json(sales);
});

router.get("/token-sales/:id", async (req, res) => {
  const [sale] = await db.query("SELECT * FROM token_sales WHERE id = ?", [req.params.id]);
  res.json(sale[0]);
});

router.patch("/token-sales/:id", async (req, res) => {
  const { name, price, endTime, isActive, lockupPeriod } = req.body;
  await db.query(
    `UPDATE token_sales SET name = ?, price = ?, end_time = ?, is_active = ?, lockup_period = ? WHERE id = ?`,
    [name, price, endTime, isActive, lockupPeriod, req.params.id]
  );
  res.json({ success: true });
});

router.delete("/token-sales/:id", async (req, res) => {
  await db.query("DELETE FROM token_sales WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// ------------------------
// 3.3 사용자 토큰 관리
// ------------------------
router.get("/users/:userId/token-wallet", async (req, res) => {
  const [wallet] = await db.query("SELECT * FROM token_wallets WHERE user_id = ?", [req.params.userId]);
  res.json(wallet[0]);
});

router.get("/users/:userId/token-transactions", async (req, res) => {
  const [txs] = await db.query("SELECT * FROM token_transactions WHERE wallet_id = (SELECT id FROM token_wallets WHERE user_id = ?) ORDER BY created_at DESC", [req.params.userId]);
  res.json(txs);
});

router.post("/token-deposit", async (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const { amount } = req.body;



  const [[wallet]] = await db.query("SELECT id FROM token_wallets WHERE user_id = ?", [userId]);
  const txId = uuidv4();
  await db.query("UPDATE token_wallets SET balance = balance + ? WHERE user_id = ?", [amount, userId]);
  await db.query("INSERT INTO token_transactions (id, wallet_id, amount, type, status) VALUES (?, ?, ?, 'DEPOSIT', 'COMPLETED')", [txId, wallet.id, amount]);
  res.json({ success: true });
});

router.post("/token-withdrawal", async (req, res) => {
    const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });
  const { amount } = req.body;

  const [[wallet]] = await db.query("SELECT id, balance FROM token_wallets WHERE user_id = ?", [userId]);
  if (wallet.balance < amount) return res.status(400).json({ error: "잔액 부족" });
  const txId = uuidv4();
  await db.query("UPDATE token_wallets SET balance = balance - ? WHERE user_id = ?", [amount, userId]);
  await db.query("INSERT INTO token_transactions (id, wallet_id, amount, type, status) VALUES (?, ?, ?, 'WITHDRAWAL', 'COMPLETED')", [txId, wallet.id, amount]);
  res.json({ success: true });
});

// ------------------------
// 3.4 토큰 구매 및 판매
// ------------------------
router.get("/active-token-sales", async (_, res) => {
  const [rows] = await db.query("SELECT * FROM token_sales WHERE is_active = TRUE AND NOW() BETWEEN start_time AND end_time");
  res.json(rows);
});
// 📁 routes/token.js (or wherever you keep your token APIs)

router.post("/purchase-token", async (req, res) => {
     const userId = req.session.user?.id;
   if (!userId) return res.status(401).json({ error: "Not authenticated" });
   const { saleId, amount } = req.body;
  // 1) load sale
  const [[sale]] = await db.query(
    `SELECT * FROM token_sales WHERE id = ? AND is_active = 1`,
    [saleId]
  );
  if (!sale) return res.status(400).json({ error: "존재하지 않거나 비활성화된 세일입니다" });

  // 2) enforce min/max/available
  if (amount < sale.minimum_purchase) 
    return res.status(400).json({ error: "최소 구매 단위 미만입니다" });
  if (sale.maximum_purchase && amount > sale.maximum_purchase) 
    return res.status(400).json({ error: "최대 구매 단위 초과입니다" });
  if (sale.remaining_supply < amount) 
    return res.status(400).json({ error: "판매 가능한 수량 부족" });

  // 3) load wallet
  const [[wallet]] = await db.query(
    `SELECT * FROM wallets WHERE user_id = ?`,
    [userId]
  );
  if (!wallet) return res.status(400).json({ error: "지갑이 없습니다" });

  const totalPrice = +(amount * sale.price).toFixed(6);
  if (wallet.quant_balance < totalPrice) {
    return res.status(400).json({ error: "잔액이 부족합니다" });
  }

  // 4) insert purchase record
  const purchaseId = uuidv4();
  const lockupUntil = sale.lockup_period
    ? new Date(Date.now() + sale.lockup_period * 86400000)
    : null;

  await db.query(
    `INSERT INTO token_purchases
      (id, user_id, token_id, sale_id, amount, price, total_price, lockup_until, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [purchaseId, userId, sale.token_id, sale.id, amount, sale.price, totalPrice, lockupUntil]
  );

  // 5) update token wallet & sales & tokens
  await db.query(
    `UPDATE token_wallets
       SET balance = balance + ?, 
           locked_amount = locked_amount + ?
     WHERE user_id = ?`,
    [amount, lockupUntil ? amount : 0, userId]
  );
  await db.query(
    `UPDATE token_sales
       SET remaining_supply = remaining_supply - ?
     WHERE id = ?`,
    [amount, sale.id]
  );
  await db.query(
    `UPDATE tokens
       SET circulating_supply = circulating_supply + ?
     WHERE id = ?`,
    [amount, sale.token_id]
  );

  // 6) deduct USDT from user wallet
  const newQuantBal = +(wallet.quant_balance - totalPrice).toFixed(6);
  await db.query(
    `UPDATE wallets
       SET quant_balance = ?, updated_at = NOW()
     WHERE user_id = ?`,
    [newQuantBal, userId]
  );

  // 7) log in wallets_log
  await db.query(
    `INSERT INTO wallets_log
      (user_id, category, log_date, direction, amount, balance_after,
       reference_type, reference_id, description, created_at, updated_at)
     VALUES (?, 'quant', NOW(), 'out', ?, ?, 'token_purchase', ?, ?, NOW(), NOW())`,
    [userId, totalPrice, newQuantBal, purchaseId, `Purchased ${amount} ${sale.name}`]
  );

  return res.json({ success: true, purchaseId });
});

router.get("/users/:userId/token-purchases", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM token_purchases WHERE user_id = ? ORDER BY created_at DESC", [req.params.userId]);
  res.json(rows);
});

module.exports = router;
