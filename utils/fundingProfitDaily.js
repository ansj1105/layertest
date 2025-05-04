// 📁 scripts/cron/fundingProfitDaily.js
const db = require("../../db");
const dayjs = require("dayjs");

(async () => {
  const today = dayjs().startOf("day");
  const yesterday = today.subtract(1, "day");

  const [investments] = await db.query(`
    SELECT fi.id, fi.project_id, fi.user_id, fi.amount, fi.created_at,
           fp.daily_rate, fp.start_date, fp.end_date
    FROM funding_investments fi
    JOIN funding_projects fp ON fi.project_id = fp.id
    WHERE fp.status = 'open' 
      AND fi.created_at <= ?
      AND ? BETWEEN DATE_ADD(fi.created_at, INTERVAL 1 DAY) AND fp.end_date
  `, [today.toDate(), today.toDate()]);

  for (const inv of investments) {
    const rate = parseFloat(inv.daily_rate) / 100;
    const profit = +(inv.amount * rate).toFixed(6);

    await db.query(`
      UPDATE funding_investments
      SET profit = profit + ?
      WHERE id = ?
    `, [profit, inv.id]);

    await db.query(`
      INSERT INTO funding_profits_log (investment_id, profit_date, profit)
      VALUES (?, ?, ?)
    `, [inv.id, today.format("YYYY-MM-DD"), profit]);
  }

  console.log(`✅ Funding profit batch complete: ${investments.length} rows`);
  process.exit();
})();
