// 📁 src/schedulers/projectScheduler.js
const cron = require('node-cron');
const db = require('../db');

// 1) 매일 자정에 수익 적립
// 1) 매일 자정에 수익 적립 (누락분 보정 포함)
async function accrueDailyProfits() {
  const now = new Date();
  console.log(`⏰ [Profit Accrual] 시작: ${now.toISOString()}`);

  try {
    const [projects] = await db.query(
      `SELECT id, daily_rate AS dailyRate, cycle_days AS cycleDays
       FROM funding_projects
       WHERE status = 'open'`
    );

    for (const { id: projectId, dailyRate, cycleDays } of projects) {
      const multiplier = dailyRate / 100;

      const [investments] = await db.query(
        `SELECT 
           id           AS investmentId,
           user_id      AS userId,
           amount,
           cycle_check  AS cycleCheck,
           created_at   AS createdAt
         FROM funding_investments
         WHERE project_id = ?`,
        [projectId]
      );

      for (const inv of investments) {
        const { investmentId, userId, amount, cycleCheck, createdAt } = inv;

        // 총 경과 일수
        const daysElapsed = Math.floor((now - new Date(createdAt)) / (1000*60*60*24));
        // 실제 지급 가능한 최대 사이클
        const maxCycles   = Math.min(daysElapsed, cycleDays);
        // 이번에 보충해서 처리할 사이클 수
        const toProcess   = maxCycles - cycleCheck;

        if (toProcess <= 0) continue;  // 이미 다 채웠거나 아직 하루도 안 지남

        const totalProfit = +(amount * multiplier * toProcess).toFixed(6);

        const conn = await db.getConnection();
        try {
          await conn.beginTransaction();

          // 1) profit 누적, cycle_check 보정
          await conn.query(
            `UPDATE funding_investments
               SET profit      = IFNULL(profit, 0) + ?,
                   cycle_check = cycle_check + ?
             WHERE id = ?`,
            [totalProfit, toProcess, investmentId]
          );

          // 2) wallets에 총 적립
          await conn.query(
            `UPDATE wallets
               SET fund_balance = fund_balance + ?, 
                   updated_at   = NOW()
             WHERE user_id = ?`,
            [totalProfit, userId]
          );

          // 3) 잔액 조회
          const [[{ fund_balance: balanceAfter }]] = await conn.query(
            `SELECT fund_balance FROM wallets WHERE user_id = ?`,
            [userId]
          );

          // 4) 로그 남기기
          await conn.query(
            `INSERT INTO wallets_log
               (user_id, category, log_date, direction, amount, balance_after, reference_type, reference_id, description)
             VALUES
               (?, 'funding', NOW(), 'in', ?, ?, 'funding_investment', ?, '일일 수익 적립 (누락 보정 ${toProcess}일)')`,
            [userId, totalProfit, balanceAfter, investmentId]
          );

          // 5) user_profit_summary 갱신
          await conn.query(
            `INSERT INTO user_profit_summary
               (user_id, funding_profit, total_profit, updated_at)
             VALUES
               (?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE
               funding_profit = funding_profit + VALUES(funding_profit),
               total_profit   = total_profit   + VALUES(funding_profit),
               updated_at     = NOW()`,
            [userId, totalProfit, totalProfit]
          );

          await conn.commit();
          console.log(`✅ 투자 ${investmentId}에 ${totalProfit} USDT 수익 적립 (보정일수: ${toProcess})`);
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
        `SELECT id, user_id AS userId, amount
         FROM funding_investments
         WHERE project_id = ?`,
        [projectId]
      );

      for (const inv of investments) {
        const { id: investId, userId, amount } = inv;
        const conn = await db.getConnection();
        try {
          await conn.beginTransaction();

          // 1) 지갑에 원금 반환
          await conn.query(
            `UPDATE wallets
               SET fund_balance = fund_balance + ?, 
                   updated_at   = NOW()
             WHERE user_id = ?`,
            [amount, userId]
          );

          // 2) 반환 후 잔액 조회
          const [[{ fund_balance: balanceAfter }]] = await conn.query(
            `SELECT fund_balance FROM wallets WHERE user_id = ?`,
            [userId]
          );

          // 3) wallets_log 에 funding 입금 로그 추가
          await conn.query(
            `INSERT INTO wallets_log
               (user_id, category, log_date, direction, amount, balance_after, reference_type, reference_id, description)
             VALUES (?, 'funding', NOW(), 'in', ?, ?, 'funding_investment', ?, '만료 프로젝트 원금 반환')`,
            [userId, amount, balanceAfter, investId]
          );

          // 4) 원래라면 투자 레코드 삭제
          // await conn.query(
          //   `DELETE FROM funding_investments WHERE id = ?`,
          //   [investId]
          // );

          await conn.commit();
          console.log(`🔄 투자 ${investId} 원금 ${amount} USDT 반환 (User ${userId})`);
        } catch (err) {
          await conn.rollback();
          console.error(`❌ 투자 ${investId} 정산 실패:`, err);
        } finally {
          conn.release();
        }
      }

      // 프로젝트 상태를 closed로 변경
      await db.query(
        `UPDATE funding_projects
           SET status     = 'closed',
               updated_at = NOW()
         WHERE id = ?`,
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
