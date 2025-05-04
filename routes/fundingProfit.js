const express = require('express');
const router = express.Router();
const db = require('../db');

// 매일 정산되는 펀딩 수익
async function calculateFundingProfits() {
  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  const [investments] = await db.query(`
    SELECT fi.id, fi.user_id, fi.project_id, fi.amount, fp.daily_rate, fi.created_at
    FROM funding_investments fi
    JOIN funding_projects fp ON fi.project_id = fp.id
    WHERE fp.status = 'open'
  `);

  for (const inv of investments) {
    const createdDate = new Date(inv.created_at).toISOString().slice(0, 10);
    if (createdDate >= today) continue; // 오늘 투자된 건은 제외

    const profit = +(inv.amount * (inv.daily_rate / 100)).toFixed(6);
    await db.query(`
      UPDATE funding_investments
      SET profit = IFNULL(profit, 0) + ?
      WHERE id = ?
    `, [profit, inv.id]);

    console.log(`💰 사용자 ${inv.user_id} 투자 ${inv.id} → +${profit} USDT`);
  }
}

module.exports = { calculateFundingProfits };
