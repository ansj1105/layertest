const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/quant-trade
router.post("/quant-trade", async (req, res) => {
  const userId = req.session?.user?.id;
  const tradeAmount = parseFloat(req.body.amount);
  const requestId = Date.now() + Math.random();

  console.log(`🔄 [${requestId}] Trade request received for user ${userId}, amount: ${tradeAmount}`);

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (isNaN(tradeAmount) || tradeAmount <= 0) {
    return res.status(400).json({ error: "Invalid trade amount" });
  }

  // 중복 실행 방지를 위한 락 키 생성
  const lockKey = `quant_trade_${userId}_${Date.now()}`;

  try {
    // 1) 사용자 지갑 & VIP 조회 (FOR UPDATE로 락)
    const [[walletRow]] = await db.query(
      `SELECT w.quant_balance, u.vip_level
       FROM wallets w
       JOIN users u ON w.user_id = u.id
       WHERE u.id = ? FOR UPDATE`,
      [userId]
    );
    if (!walletRow) return res.status(404).json({ error: "Wallet not found" });

    const currentBal = parseFloat(walletRow.quant_balance);
    const vipLevel = walletRow.vip_level;
    const [[vip]] = await db.query("SELECT * FROM vip_levels WHERE level = ?", [vipLevel]);
    if (!vip) return res.status(400).json({ error: "Invalid VIP level" });

    const maxInvestment = parseFloat(vip.max_investment);
    const minHoldings = parseFloat(vip.min_holdings);
    console.log(`💡 [${requestId}] [QuantTrade] user ${userId} - tradeAmount=${tradeAmount}, currentBal=${currentBal}, max_investment=${maxInvestment}, min_holdings=${minHoldings}`);

    // 투자 한도 및 보유량 체크
    if (tradeAmount > maxInvestment) {
      console.warn(`⚠️ [${requestId}] [QuantTrade] Exceeds max investment: ${tradeAmount} > ${maxInvestment}`);
      return res.status(400).json({ error: "Exceeds max investment for VIP level" });
    }
    if (currentBal < minHoldings) {
      console.warn(`⚠️ [${requestId}] [QuantTrade] Insufficient holdings: ${currentBal} < ${minHoldings}`);
      return res.status(400).json({ error: "Minimum holdings not met for VIP level" });
    }

    // 2) 일일 거래 한도 체크 (중복 방지 포함)
    const [[{ count: tradesToday }]] = await db.query(
      `SELECT COUNT(*) AS count
       FROM quant_trades
       WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
      [userId]
    );
    if (tradesToday >= vip.daily_trade_limit) {
      console.warn(`⚠️ [${requestId}] [QuantTrade] Daily limit exceeded: ${tradesToday} >= ${vip.daily_trade_limit}`);
      return res.status(400).json({ error: "Daily trade limit exceeded" });
    }

    // 3) 최근 거래 중복 체크 (5초 내)
    const [[{ count: recentTrades }]] = await db.query(
      `SELECT COUNT(*) AS count
       FROM quant_trades
       WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 5 SECOND)`,
      [userId]
    );
    if (recentTrades > 0) {
      console.warn(`⚠️ [${requestId}] [QuantTrade] Duplicate trade detected for user ${userId}`);
      return res.status(429).json({ error: "Duplicate trade request. Please wait a moment." });
    }

    console.log(`✅ [${requestId}] All checks passed, proceeding with trade`);

    // 4) 커미션 비율 산정
    const minRate = parseFloat(vip.commission_min) / vip.daily_trade_limit;
    const maxRate = parseFloat(vip.commission_max) / vip.daily_trade_limit;
    const commissionRate = (Math.random() * (maxRate - minRate)) + minRate;

    // 5) 수익 계산
    const profit = tradeAmount * (commissionRate / 100);
    const userProfit = profit;
    const platformFee = 0;

    // 6) 거래 기록 저장
    const [result] = await db.query(
      `INSERT INTO quant_trades (user_id, amount, commission_rate, user_earning, platform_fee, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, tradeAmount, commissionRate.toFixed(4), userProfit, platformFee]
    );
    const tradeId = result.insertId;
    console.log(`💾 [${requestId}] [QuantTrade] Inserted quant_trades id=${tradeId}, user_earning=${userProfit}, platform_fee=${platformFee}`);

    // 7) 사용자 지갑 업데이트
    await db.query(
      `UPDATE wallets
       SET quant_balance = quant_balance + ?
       WHERE user_id = ?`,
      [userProfit, userId]
    );

    // 8) 수익 기록
    await db.query(
      `INSERT INTO quant_profits (user_id, trade_id, amount, type, created_at)
       VALUES (?, ?, ?, 'trade', NOW())`,
      [userId, tradeId, userProfit]
    );

    // 9) user_profit_summary 업데이트
    await db.query(
      `INSERT INTO user_profit_summary (user_id, quant_profit, total_profit, updated_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         quant_profit = quant_profit + VALUES(quant_profit),
         total_profit = total_profit + VALUES(total_profit),
         updated_at = NOW()`,
      [userId, userProfit, userProfit]
    );

    // 10) 추천 보상 분배
    const [relations] = await db.query(
      `SELECT referrer_id, level
       FROM referral_relations
       WHERE referred_id = ? AND status = 'active' AND level IN (1,2,3)`,
      [userId]
    );
    const [[settings]] = await db.query(
      `SELECT levelA, levelB, levelC FROM referral_reward_settings LIMIT 1`
    );

    for (const { referrer_id, level } of relations) {
      let pct = level === 1 ? settings.levelA : level === 2 ? settings.levelB : settings.levelC;
      const reward = userProfit * (pct / 100);
      if (reward <= 0) continue;

      await db.query(
        `UPDATE wallets
         SET quant_balance = quant_balance + ?
         WHERE user_id = ?`,
        [reward, referrer_id]
      );

      await db.query(
        `INSERT INTO quant_profits (user_id, trade_id, amount, type, level, created_at)
         VALUES (?, ?, ?, 'referral', ?, NOW())`,
        [referrer_id, tradeId, reward, level]
      );

      await db.query(
        `INSERT INTO user_profit_summary (user_id, quant_profit, total_profit, updated_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           quant_profit = quant_profit + VALUES(quant_profit),
           total_profit = total_profit + VALUES(total_profit),
           updated_at = NOW()`,
        [referrer_id, reward, reward]
      );

      await db.query(
        `INSERT INTO quant_logs (user_id, action, detail, created_at)
         VALUES (?, 'referral_reward', ?, NOW())`,
        [referrer_id, `trade ${tradeId}, level ${level}, reward ${reward.toFixed(6)}`]
      );
    }

    console.log(`✅ [${requestId}] Trade completed successfully`);
    return res.json({
      success: true,
      message: `Trade successful: earned ${userProfit.toFixed(6)} USDT`,
      rate: commissionRate.toFixed(4)
    });
  } catch (err) {
    console.error(`❌ [${requestId}] Quant trade error:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/quant-profits/summary
router.get("/quant-profits/summary", async (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [[{ totalProfit }]] = await db.query(
      `SELECT IFNULL(SUM(amount),0) AS totalProfit
       FROM quant_profits
       WHERE user_id = ?`,
      [userId]
    );
    const [[{ todayProfit }]] = await db.query(
      `SELECT IFNULL(SUM(amount),0) AS todayProfit
       FROM quant_profits
       WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
      [userId]
    );
    res.json({ success: true, data: { totalProfit, todayProfit } });
  } catch (err) {
    console.error("❌ quant-profits summary error:", err);
    res.status(500).json({ error: "quant-profits summary failed" });
  }
});


// GET /api/quant-profits/history
router.get("/quanthistory", async (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    // join quant_profits → quant_trades to pull trade details
    const [rows] = await db.query(`
      SELECT
        qp.id,
        qp.type,
        qp.level,
        qp.amount          AS profit,
        qp.created_at      AS createdAt,
        qt.amount          AS tradeAmount,
        qt.commission_rate AS commissionRate,
        qt.platform_fee    AS platformFee
      FROM quant_profits qp
      JOIN quant_trades qt ON qp.trade_id = qt.id
      WHERE qp.user_id = ?
      ORDER BY qp.created_at DESC
      LIMIT 50
    `, [userId]);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ quant-profits history error:", err);
    res.status(500).json({ error: "quant-profits history failed" });
  }
});
// GET /api/quant-trade/count-today
router.get("/quant-trade/count-today", async (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) AS count
       FROM quant_trades
       WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
      [userId]
    );
    res.json({ success: true, data: { tradesToday: count } });
  } catch (err) {
    console.error("❌ quant-trade count-today error:", err);
    res.status(500).json({ error: "count-today failed" });
  }
});

module.exports = router;
