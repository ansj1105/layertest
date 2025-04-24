// 📁 routes/quanttrade.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/quant-trade
router.post("/quant-trade", async (req, res) => {
  const userId = req.session?.user?.id;
  const tradeAmount = parseFloat(req.body.amount);

  try {
    const [[user]] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user) return res.status(404).json({ error: "User not found" });

    const [[vip]] = await db.query("SELECT * FROM vip_levels WHERE level = ?", [user.vip_level]);
    if (!vip) return res.status(400).json({ error: "Invalid VIP level" });

    if (user.usdt_balance < vip.min_holdings) {
      return res.status(400).json({ error: "Minimum holdings not met for VIP level" });
    }

    // ✅ 일일 거래 횟수 체크
    const [tradesToday] = await db.query(
      `SELECT COUNT(*) as count FROM quant_trades WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
      [userId]
    );

    if (tradesToday[0].count >= vip.daily_trade_limit) {
      return res.status(400).json({ error: "Daily trade limit exceeded" });
    }

    // ✅ 거래 수익 계산
    const commissionRate = (Math.random() * (vip.commission_max - vip.commission_min)) + vip.commission_min;
    const profit = tradeAmount * (commissionRate / 100);
    const userEarning = profit / 2;
    const platformFee = profit / 2;

    // ✅ 거래 기록 저장
    await db.query(
      `INSERT INTO quant_trades (user_id, amount, commission_rate, user_earning, platform_fee, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, tradeAmount, commissionRate.toFixed(2), userEarning, platformFee]
    );

    // ✅ 사용자 수익 반영
    await db.query("UPDATE users SET usdt_balance = usdt_balance + ? WHERE id = ?", [userEarning, userId]);

    return res.json({
      success: true,
      message: `✅ 거래 성공 - 수익: ${userEarning.toFixed(4)} USDT`,
      rate: commissionRate.toFixed(2)
    });
  } catch (err) {
    console.error("Quant trade error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
