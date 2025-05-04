// 📁 src/schedulers/projectScheduler.js
const cron = require('node-cron');
const db = require('../db');

// 1) 매일 자정에 수익 적립
async function accrueDailyProfits() {
  const today = new Date();
  console.log(`⏰ [Profit Accrual] 시작: ${today.toISOString()}`);

  try {
    // 오픈된 모든 프로젝트
    const [projects] = await db.query(
      `SELECT id, start_date, daily_rate, cycle_days
       FROM funding_projects
       WHERE status = 'open'`
    );

    for (const proj of projects) {
      const { id: projectId, start_date: startDate, daily_rate: dailyRate, cycle_days: cycleDays } = proj;
      const now = new Date();
      const started = new Date(startDate);
      const daysSinceStart = Math.floor((now - started) / (1000 * 60 * 60 * 24));
    
      // 시작 전에거나 만료 이후는 건너뜀
      if (daysSinceStart <= 0 || daysSinceStart > cycleDays) continue;
    
      const dailyMultiplier = dailyRate / 100;
      // ① 각 투자에 대해 일일 수익 계산 및 지급
  
  // 투자별 수익 계산 및 지급
  const [investments] = await db.query(
    `SELECT id AS investmentId, user_id AS userId, amount
     FROM funding_investments
     WHERE project_id = ?`,
    [projectId]
  );

  for (const inv of investments) {
    const { investmentId, userId, amount } = inv;
    const profit = +(amount * dailyMultiplier).toFixed(6);

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // a) 투자 테이블에 수익 누적
      await conn.query(
        `UPDATE funding_investments
         SET profit = IFNULL(profit, 0) + ?
         WHERE id = ?`,
        [profit, investmentId]
      );

      // b) 지갑에 수익 지급
      await conn.query(
        `UPDATE wallets
         SET fund_balance = fund_balance + ?, updated_at = NOW()
         WHERE user_id = ?`,
        [profit, userId]
      );

      // c) 사용자별 수익 요약 테이블 업데이트
      await conn.query(
        `INSERT INTO user_profit_summary (user_id, funding_profit, total_profit, updated_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           funding_profit = funding_profit + VALUES(funding_profit),
           total_profit   = total_profit   + VALUES(funding_profit),
           updated_at     = NOW()`,
        [userId, profit, profit]
      );

      await conn.commit();
      console.log(`✅ 투자 ${investmentId}에 ${profit} USDT 수익 적립 (User ${userId})`);
    } catch (err) {
      await conn.rollback();
      console.error(`❌ 투자 ${investmentId} 수익 적립 실패:`, err);
    } finally {
      conn.release();
    }
      }
    }
  } catch (err) {
    console.error('❌ 수익 적립 전체 실패:', err);
  }
}

// 2) 매일 새벽 1시에 만료된 프로젝트 정산 후 삭제
async function handleProjectExpiry() {
  const now = new Date();
  console.log(`⏰ [Project Expiry] 시작: ${now.toISOString()}`);

  try {
    // 만료된 오픈 상태 프로젝트 조회
    const [expiredProjects] = await db.query(
      `SELECT id FROM funding_projects
       WHERE status = 'open' AND end_date <= NOW()`
    );

    for (const proj of expiredProjects) {
      const projectId = proj.id;

      // 해당 프로젝트의 모든 투자 조회
      const [investments] = await db.query(
        `SELECT id, user_id, amount
         FROM funding_investments
         WHERE project_id = ?`,
        [projectId]
      );

      for (const inv of investments) {
        const { id: investId, user_id: userId, amount } = inv;
        const conn = await db.getConnection();
        try {
          await conn.beginTransaction();

          // 지갑에 원금 반환
          await conn.query(
            `UPDATE wallets
             SET fund_balance = fund_balance + ?, updated_at = NOW()
             WHERE user_id = ?`,
            [amount, userId]
          );

          // 투자 레코드 삭제
          await conn.query(
            `DELETE FROM funding_investments WHERE id = ?`,
            [investId]
          );

          await conn.commit();
          console.log(`🔄 투자 ${investId} 원금 ${amount} USDT 반환 (User ${userId})`);
        } catch (err) {
          await conn.rollback();
          console.error(`❌ 투자 ${investId} 정산 실패:`, err);
        } finally {
          conn.release();
        }
      }

      // 프로젝트 상태를 closed로 변경하거나 삭제
      await db.query(
        `UPDATE funding_projects SET status = 'closed' WHERE id = ?`,
        [projectId]
      );
      console.log(`✅ 프로젝트 ${projectId} 만료 처리 완료`);
    }
  } catch (err) {
    console.error('❌ 프로젝트 만료 처리 전체 실패:', err);
  }
}

// 스케줄러 등록
cron.schedule('0 0 * * *', () => {
  accrueDailyProfits();
});

cron.schedule('0 1 * * *', () => {
  handleProjectExpiry();
});

module.exports = {
  accrueDailyProfits,
  handleProjectExpiry
};
