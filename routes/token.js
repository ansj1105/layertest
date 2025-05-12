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


// ------------------------
// 3.4 토큰 구매 및 판매
// ------------------------
// 📁 routes/token.js

// 3.4 토큰 구매 및 판매
router.post("/purchase-token", async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { saleId, amount } = req.body;
  let purchaseId;

  try {
    // 1) load sale
    const [[sale]] = await db.query(
      `SELECT * FROM token_sales
         WHERE id = ? AND is_active = 1`,
      [saleId]
    );
    if (!sale) throw new Error("NO_SALE");

    // 2) enforce min/max/available
    if (amount < sale.minimum_purchase) throw new Error("BELOW_MIN");
    if (sale.maximum_purchase && amount > sale.maximum_purchase) throw new Error("ABOVE_MAX");
    if (sale.remaining_supply < amount) throw new Error("NO_SUPPLY");

    // 3) load user wallet
    const [[wallet]] = await db.query(
      `SELECT * FROM wallets WHERE user_id = ?`,
      [userId]
    );
    if (!wallet) throw new Error("NO_WALLET");

    // 4) price check
    const totalPrice = +(amount * sale.price).toFixed(6);
    if (wallet.quant_balance < totalPrice) throw new Error("INSUFFICIENT_FUNDS");

    // 5) generate purchaseId via MySQL UUID()
    const [[{ id: genId }]] = await db.query(`SELECT UUID() AS id`);
    purchaseId = genId;

    // 6) record purchase with status PENDING
    const lockupUntil = sale.lockup_period
      ? new Date(Date.now() + sale.lockup_period * 86400000)
      : null;

    await db.query(
      `INSERT INTO token_purchases
         (id, user_id, token_id, sale_id, amount, price, total_price,
          status, lockup_until, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, NOW())`,
      [purchaseId, userId, sale.token_id, sale.id, amount, sale.price, totalPrice, lockupUntil]
    );

    // 7) update token_wallets balance & locked_amount
    await db.query(
      `UPDATE token_wallets
         SET balance       = balance + ?,
             locked_amount = locked_amount + ?
       WHERE user_id = ?`,
      [amount, lockupUntil ? amount : 0, userId]
    );

    // 8) insert into token_lockups for granular 락업 관리
    if (lockupUntil) {
      await db.query(
        `INSERT INTO token_lockups
           (id, wallet_id, amount, unlock_at)
         VALUES (UUID(), (SELECT id FROM token_wallets WHERE user_id=?), ?, ?)`,
        [userId, amount, lockupUntil]
      );
    }

    // 9) update token_sales & tokens
    await Promise.all([
      db.query(
        `UPDATE token_sales
           SET remaining_supply = remaining_supply - ?
         WHERE id = ?`,
        [amount, sale.id]
      ),
      db.query(
        `UPDATE tokens
           SET circulating_supply = circulating_supply + ?
         WHERE id = ?`,
        [amount, sale.token_id]
      )
    ]);

    // 10) deduct USDT from user wallet
    const newQuantBal = +(wallet.quant_balance - totalPrice).toFixed(6);
    await db.query(
      `UPDATE wallets
         SET quant_balance = ?, updated_at = NOW()
       WHERE user_id = ?`,
      [newQuantBal, userId]
    );

    // 11) finalize purchase
    await db.query(
      `UPDATE token_purchases
         SET status = 'COMPLETED', updated_at = NOW()
       WHERE id = ?`,
      [purchaseId]
    );

    // 12) log in wallets_log
    await db.query(
      `INSERT INTO wallets_log
         (user_id, category, log_date, direction, amount, balance_after,
          reference_type, reference_id, description, created_at)
       VALUES (?, 'quant', NOW(), 'out', ?, ?, 'token_purchase', ?, ?, NOW())`,
      [userId, totalPrice, newQuantBal, purchaseId, `Purchased ${amount} ${sale.name}`]
    );

    return res.json({ success: true, purchaseId });
  } catch (err) {
    // 실패 시 token_purchases는 PENDING 상태로 남고,
    // token_lockups 도 롤백 되지 않으므로, 필요하다면 수동 삭제하거나
    // 상태 필드를 이용해 expired 처리 하실 수 있습니다.
    console.error("❌ purchase-token error:", err);
    switch (err.message) {
      case "NO_SALE":
      case "BELOW_MIN":
      case "ABOVE_MAX":
      case "NO_SUPPLY":
      case "NO_WALLET":
      case "INSUFFICIENT_FUNDS":
        return res.status(400).json({ error: err.message });
      default:
        return res.status(500).json({ error: "Internal server error" });
    }
  }
});


router.get("/users/:userId/token-purchases", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM token_purchases WHERE user_id = ? ORDER BY created_at DESC", [req.params.userId]);
  res.json(rows);
});

// ▶ 특정 주문 상세 조회
// GET /api/token-purchases/:purchaseId
router.get('/token-purchases/:purchaseId', async (req, res) => {
  const purchaseId = req.params.purchaseId;
  try {
    const [rows] = await db.query(
      `SELECT
         id,
         user_id,
         token_id,
         sale_id,
         amount,
         price,
         total_price,
         status,
         lockup_until,
         created_at,
         updated_at
       FROM token_purchases
       WHERE id = ?`,
      [purchaseId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: '해당 주문을 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('❌ 주문 상세 조회 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류로 조회에 실패했습니다.' });
  }
});

// ▶ 전체 주문 목록 조회
// GET /api/token-purchases
router.get('/token-purchases', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         id,
         user_id,
         token_id,
         sale_id,
         amount,
         price,
         total_price,
         status,
         lockup_until,
         created_at,
         updated_at
       FROM token_purchases
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('❌ 전체 주문 조회 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류로 조회에 실패했습니다.' });
  }
});

// ▶ 내 토큰 지갑 전체 조회
// GET /api/token/my/wallet-details
router.get("/my/wallet-details", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    // 1) token_wallets에서 내 지갑 조회
    const [[wallet]] = await db.query(
      `SELECT id, user_id, balance, locked_amount, created_at, updated_at
         FROM token_wallets
        WHERE user_id = ?`,
      [userId]
    );
    if (!wallet) {
      return res.status(404).json({ success: false, error: "Token wallet not found" });
    }

    // 2) token_lockups에서 이 지갑의 모든 락업 내역 조회
    const [lockups] = await db.query(
      `SELECT id, wallet_id, amount, unlock_at, created_at
         FROM token_lockups
        WHERE wallet_id = ?
        ORDER BY unlock_at ASC`,
      [wallet.id]
    );

    // 3) 응답
    return res.json({
      success: true,
      data: {
        wallet,
        lockups
      }
    });
  } catch (err) {
    console.error("❌ /my/wallet-details error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});


// ▶ 내 주문 목록 조회
// GET /api/my/token-purchases
router.get('/my/token-purchases', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' });

  try {
    const [rows] = await db.query(
      `SELECT
         id,
         token_id,
         sale_id,
         amount,
         price,
         total_price,
         status,
         lockup_until,
         created_at,
         updated_at
       FROM token_purchases
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('❌ 내 주문 목록 조회 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류로 조회에 실패했습니다.' });
  }
});

// ▶ 내 특정 주문 상세 조회
// GET /api/my/token-purchases/:purchaseId
router.get('/my/token-purchases/:purchaseId', async (req, res) => {
  const userId     = req.session.user?.id;
  const purchaseId = req.params.purchaseId;
  if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' });

  try {
    const [rows] = await db.query(
      `SELECT
         id,
         token_id,
         sale_id,
         amount,
         price,
         total_price,
         status,
         lockup_until,
         created_at,
         updated_at
       FROM token_purchases
       WHERE id = ? AND user_id = ?`,
      [purchaseId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: '해당 주문을 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('❌ 내 주문 상세 조회 오류:', err);
    res.status(500).json({ success: false, error: '서버 오류로 조회에 실패했습니다.' });
  }
});
module.exports = router;
