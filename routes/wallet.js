// 📁 routes/wallet.js
const express = require('express');
const db = require('../db');
const router = express.Router();

//— 기존 설정·요청·요약·이력·펀딩 조회·입출금 요청·관리 엔드포인트 —
// (생략—위에 이미 작성하신 부분)

/** ▶ 사용자 상세 지갑 페이지 **/
router.get('/detail', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    // 잔액 + 오늘/누적 수입
    const [[{ balance }]] = await db.query(
      'SELECT usdt_balance AS balance FROM users WHERE id=?',
      [userId]
    );
    const [[{ todayIncome }]] = await db.query(
      `SELECT IFNULL(SUM(
         CASE WHEN status='approved' AND type='deposit' THEN amount - fee
              WHEN status='approved' AND type='withdraw' THEN -(amount + fee)
              ELSE 0 END),0) AS todayIncome
       FROM wallet_requests
       WHERE user_id=? AND DATE(created_at)=CURDATE()`,
      [userId]
    );
    // 세부 이력 10건
    const [history] = await db.query(
      `SELECT id, type, amount, fee, status, created_at, processed_at
       FROM wallet_requests
       WHERE user_id=? ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );
    res.json({ balance, todayIncome, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Detail fetch failed' });
  }
});

/** ▶ 나의 전체 주문내역 (alias of history) **/
router.get('/orders', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const [rows] = await db.query(
      `SELECT id, type, amount, fee, status, created_at, processed_at
       FROM wallet_requests
       WHERE user_id=? ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Orders fetch failed' });
  }
});

/** ▶ 펀딩 프로젝트 상세 조회 **/
router.get('/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [[proj]] = await db.query(
      `SELECT id, name, description, min_amount AS minAmount, max_amount AS maxAmount,
              daily_rate AS dailyRate, cycle_days AS cycle, start_date, end_date,
              min_participants AS minParticipants, status, target_amount
       FROM funding_projects
       WHERE id = ?`,
      [id]
    );
    if (!proj) return res.status(404).json({ error: 'Project not found' });
    res.json(proj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Project fetch failed' });
  }
});

/** ▶ 특정 프로젝트 투자자 목록 **/
router.get('/projects/:id/investors', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT fi.id, fi.amount, fi.created_at,
              u.id AS userId, u.email
       FROM funding_investments fi
       JOIN users u ON u.id = fi.user_id
       WHERE fi.project_id = ?
       ORDER BY fi.created_at DESC`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Investors fetch failed' });
  }
});

/** ▶ 관리자용: 펀딩 프로젝트 CRUD **/
router.post('/projects', async (req, res) => {
  const { name, description, minAmount, maxAmount, targetAmount, dailyRate, cycle, startDate, endDate, minParticipants } = req.body;
  try {
    const [r] = await db.query(
      `INSERT INTO funding_projects
       (name, description, min_amount, max_amount, target_amount, daily_rate, cycle_days, start_date, end_date, min_participants, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [name, description, minAmount, maxAmount, targetAmount, dailyRate, cycle, startDate, endDate, minParticipants]
    );
    res.json({ success: true, projectId: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Project creation failed' });
  }
});

router.put('/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, minAmount, maxAmount, targetAmount, dailyRate, cycle, startDate, endDate, minParticipants, status } = req.body;
  try {
    await db.query(
      `UPDATE funding_projects
       SET name=?, description=?, min_amount=?, max_amount=?, target_amount=?, daily_rate=?, cycle_days=?,
           start_date=?, end_date=?, min_participants=?, status=?
       WHERE id=?`,
      [name, description, minAmount, maxAmount, targetAmount, dailyRate, cycle, startDate, endDate, minParticipants, status, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Project update failed' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM funding_projects WHERE id=?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Project deletion failed' });
  }
});

/** ▶ 관리자용: 전체 펀딩 프로젝트 목록 조회 */
router.get('/projects', async (req, res) => {
    try {
      const [projects] = await db.query(
        `SELECT 
           id,
           name,
           description,
           min_amount AS minAmount,
           max_amount AS maxAmount,
           target_amount AS targetAmount,
           daily_rate AS dailyRate,
           cycle_days   AS cycle,
           start_date   AS startDate,
           end_date     AS endDate,
           min_participants AS minParticipants,
           status
         FROM funding_projects
         ORDER BY created_at DESC`
      );
      res.json(projects);
    } catch (err) {
      console.error('Projects fetch failed', err);
      res.status(500).json({ error: 'Projects fetch failed' });
    }
  });

  // 📁 routes/wallet.js

/**
 * ▶ 펀딩 프로젝트 투자
 * POST /api/wallet/projects/:id/invest
 * body: { amount: number }
 */
// 📁 routes/wallet.js (투자 API 수정)
router.post('/projects/:id/invest', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const projectId = req.params.id;
  const { amount } = req.body;
  const investAmount = parseFloat(amount);
  if (isNaN(investAmount) || investAmount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    // 1) 내 지갑 잔액 확인
    const [[wallet]] = await db.query(
      'SELECT fund_balance FROM wallets WHERE user_id = ?',
      [userId]
    );
    if (!wallet || wallet.fund_balance < investAmount) {
      return res.status(400).json({ error: 'Insufficient fund balance' });
    }

    // 2) 프로젝트 설정 조회 (open 상태)
    const [[proj]] = await db.query(
      `SELECT daily_rate AS dailyRate,
              cycle_days AS cycleDays,
              target_amount AS targetAmount,
              current_amount AS currentAmount,
              max_amount    AS maxAmount,
              status
       FROM funding_projects
       WHERE id = ? AND status = 'open'`,
      [projectId]
    );
    if (!proj) {
      return res.status(404).json({ error: 'Project not found or closed' });
    }

    // 3) 프로젝트 전체 잔여 투자 가능금액 체크
    const remaining = parseFloat(proj.targetAmount) - parseFloat(proj.currentAmount);
    if (investAmount > remaining) {
      return res.status(400).json({ error: 'Exceeded project remaining capacity' });
    }

    // 4) 해당 유저의 기존 프로젝트당 투자 합산 조회
    const [[userTotalRow]] = await db.query(
      `SELECT IFNULL(SUM(amount),0) AS userTotal
       FROM funding_investments
       WHERE project_id = ? AND user_id = ?`,
      [projectId, userId]
    );
    const userTotal = parseFloat(userTotalRow.userTotal);
    if (userTotal + investAmount > parseFloat(proj.maxAmount)) {
      return res.status(400).json({ error: `Individual investment limit of ${proj.maxAmount} USDT exceeded` });
    }

    // 5) profit 계산 (예: amount * dailyRate/100 * cycleDays)
    const profit = parseFloat(
      (investAmount * (proj.dailyRate / 100) * proj.cycleDays).toFixed(6)
    );

    // 6) 투자 기록 삽입
    const [insertResult] = await db.query(
      `INSERT INTO funding_investments
         (project_id, user_id, amount, profit, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [projectId, userId, investAmount, profit]
    );
    const investmentId = insertResult.insertId;

    // 7) 지갑에서 금액 차감
    await db.query(
      `UPDATE wallets
         SET fund_balance = fund_balance - ?, updated_at = NOW()
       WHERE user_id = ?`,
      [investAmount, userId]
    );

    // 8) 프로젝트 current_amount 갱신
    await db.query(
      `UPDATE funding_projects
         SET current_amount = current_amount + ?
       WHERE id = ?`,
      [investAmount, projectId]
    );

    // ───────────────────────────────────────────────────────────
    // 9) funding_profits_log 테이블에 로그 추가
    await db.query(
      `INSERT INTO funding_profits_log
         (investment_id, profit_date, profit, created_at)
       VALUES (?, CURDATE(), ?, NOW())`,
      [investmentId, profit]
    );

    // 10) user_profit_summary 테이블에 누적 반영 (upsert)
    //    user_profit_summary.user_id를 PK 또는 UNIQUE로 설정해야 ON DUPLICATE KEY가 동작합니다.
    await db.query(
      `INSERT INTO user_profit_summary
         (user_id, funding_profit, quant_profit, qvc_profit, total_profit, updated_at)
       VALUES (?, ?, 0, 0, ?, NOW())
       ON DUPLICATE KEY UPDATE
         funding_profit = funding_profit + VALUES(funding_profit),
         total_profit   = total_profit   + VALUES(funding_profit),
         updated_at     = NOW()
      `,
      [userId, profit, profit]
    );
    // ───────────────────────────────────────────────────────────

    res.json({ success: true, profit });
  } catch (err) {
    console.error('투자 처리 오류:', err);
    res.status(500).json({ error: 'Investment failed' });
  }
});

  // 📁 routes/wallet.js
// …(기존 코드)…

/** ▶ 사용자 금융 지갑 잔액 + 펀딩 수익 요약 조회 ▶ /api/wallet/finance-summary */
/** ▶ 금융지갑 요약 fetch */
// 📁 routes/wallet.js
// ▶ 금융지갑 + 펀딩수익 요약 조회
// 📁 routes/wallet.js

router.get('/finance-summary', async (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
    try {
      // 1) 지갑 잔액
      const [walletRows] = await db.query(
        `SELECT quant_balance, fund_balance
         FROM wallets
         WHERE user_id = ?`,
        [userId]
      );
      const {
        quant_balance = 0,
        fund_balance  = 0
      } = walletRows[0] || {};
  
      // 2) 오늘 펀딩 수익
      const [[{ todayProjectIncome = 0 }]] = await db.query(
        `SELECT IFNULL(SUM(profit),0) AS todayProjectIncome
         FROM funding_investments
         WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
        [userId]
      );
  
      // 3) 누적 펀딩 수익
      const [[{ totalProjectIncome = 0 }]] = await db.query(
        `SELECT IFNULL(SUM(profit),0) AS totalProjectIncome
         FROM funding_investments
         WHERE user_id = ?`,
        [userId]
      );
        // 4) 디포짓수수료료
      const [[{ depositFee = 0 }]] = await db.query(
        `SELECT deposit_fee_rate AS depositFee
         FROM wallet_settings
        `,
        [userId]
      );
              // 4) 출금짓수수료료
      const [[{ withdrawFee = 0 }]] = await db.query(
        `SELECT withdraw_fee_rate AS withdrawFee
         FROM wallet_settings
        `,
        [userId]
      );
      res.json({
        success: true,
        data: {
          quantBalance: Number(quant_balance),
          fundBalance:  Number(fund_balance),
          todayProjectIncome,
          totalProjectIncome,
          depositFee,
          withdrawFee
        }
      });
    } catch (err) {
      console.error('❌ finance-summary 오류:', err);
      res.status(500).json({ error: 'finance-summary failed' });
    }
  });
  
/** ▶ quant-summary: 퀀트 지갑 요약 조회 */
router.get('/quant-summary', async (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
    try {
      // 1) quant_balance 조회
      const [[{ quant_balance }]] = await db.query(
        'SELECT quant_balance FROM wallets WHERE user_id = ?',
        [userId]
      );
  
      // 2) 오늘의 퀀트 수익 합계
      const [[{ todayQuantIncome }]] = await db.query(
        `SELECT IFNULL(SUM(profit), 0) AS todayQuantIncome
         FROM quant_trades
         WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
        [userId]
      );
  
      // 3) 누적 퀀트 수익 합계
      const [[{ totalQuantIncome }]] = await db.query(
        `SELECT IFNULL(SUM(profit), 0) AS totalQuantIncome
         FROM quant_trades
         WHERE user_id = ?`,
        [userId]
      );
  
      res.json({
        success: true,
        data: {
          quantBalance: quant_balance,
          todayQuantIncome,
          totalQuantIncome
        }
      });
    } catch (err) {
      console.error('❌ quant-summary 오류:', err);
      res.status(500).json({ error: 'quant-summary failed' });
    }
  });
  


  
// 요청: { amount: number }

// ─── 1) 환송: fund_balance → quant_balance ───────────────────────────────
// 요청 body: { amount: number }
router.post("/transfer-to-quant",  async (req, res) => {
  const userId = req.session.user.id;
  const amount = parseFloat(req.body.amount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1) 설정에서 deposit_fee_rate 읽기
    const [settingsRows] = await conn.query(
      `SELECT deposit_fee_rate 
         FROM wallet_settings 
        ORDER BY id DESC 
        LIMIT 1`
    );
    const depositFeeRate = parseFloat(settingsRows[0]?.deposit_fee_rate) || 0;

    // 2) 현재 fund_balance 읽기 (잠금)
    const [rows] = await conn.query(
      "SELECT fund_balance, quant_balance FROM wallets WHERE user_id = ? FOR UPDATE",
      [userId]
    );
    if (!rows.length) throw new Error("Wallet not found");
    
    const beforeFund  = parseFloat(rows[0].fund_balance);
    const beforeQuant = parseFloat(rows[0].quant_balance);
    
    if (beforeFund < amount) {
      await conn.rollback();
      return res.status(400).json({ error: "Insufficient fund balance" });
    }
    

    // 3) 수수료/실제 이체금 계산
    const fee     = +(amount * (depositFeeRate / 100)).toFixed(6);
    const netAmt  = +(amount - fee).toFixed(6);
    const afterFund  = +(beforeFund - amount).toFixed(6);
    const afterQuant = +(beforeQuant + netAmt).toFixed(6);

    // 4) 잔액 업데이트
    await conn.query(`
      UPDATE wallets SET fund_balance = ?, quant_balance = ? WHERE user_id = ?
    `, [afterFund, afterQuant, userId]);


        // 로그 기록
    await conn.query(`
      INSERT INTO wallet_transfer_logs 
        (user_id, direction, amount, fee_rate, fee, before_fund, after_fund, before_quant, after_quant)
      VALUES (?, 'fund_to_quant', ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, amount, depositFeeRate, fee,
      beforeFund, afterFund,
      beforeQuant, afterQuant
    ]);
    await conn.commit();
    res.json({
      success: true,
      transferred: netAmt,
      fee,
      feeRate: depositFeeRate
    });
  } catch (err) {
    await conn.rollback();
    console.error("Transfer to quant error:", err);
    res.status(500).json({ error: "Transfer failed" });
  } finally {
    conn.release();
  }
});

// ─── 2) 전출: quant_balance → fund_balance ────────────────────────────────
// 요청 body: { amount: number }
router.post("/transfer-to-fund",  async (req, res) => {
  const userId = req.session.user.id;
  const amount = parseFloat(req.body.amount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1) 설정에서 withdraw_fee_rate 읽기
    const [settingsRows] = await conn.query(
      `SELECT withdraw_fee_rate 
         FROM wallet_settings 
        ORDER BY id DESC 
        LIMIT 1`
    );
    const withdrawFeeRate = parseFloat(settingsRows[0]?.withdraw_fee_rate) || 0;

    // 2) 현재 quant_balance 읽기 (잠금)
    const [rows] = await conn.query(
      "SELECT fund_balance, quant_balance FROM wallets WHERE user_id = ? FOR UPDATE",
      [userId]
    );
    if (!rows.length) throw new Error("Wallet not found");
    
    const beforeQuant = parseFloat(rows[0].quant_balance);
    const beforeFund  = parseFloat(rows[0].fund_balance);

 
    if (beforeQuant < amount) {
      await conn.rollback();
      return res.status(400).json({ error: "Insufficient quant balance" });
    }

    // 3) 수수료/실제 이체금 계산
    const fee    = +(amount * (withdrawFeeRate / 100)).toFixed(6);
    const netAmt = +(amount - fee).toFixed(6);
    const afterQuant = +(beforeQuant - amount).toFixed(6);
    const afterFund  = +(beforeFund + netAmt).toFixed(6);

    // 4) 잔액 업데이트
    await conn.query(`
      UPDATE wallets SET fund_balance = ?, quant_balance = ? WHERE user_id = ?
    `, [afterFund, afterQuant, userId]);

    // 로그 기록
    await conn.query(`
      INSERT INTO wallet_transfer_logs 
        (user_id, direction, amount, fee_rate, fee, before_fund, after_fund, before_quant, after_quant)
      VALUES (?, 'quant_to_fund', ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, amount, withdrawFeeRate, fee,
      beforeFund, afterFund,
      beforeQuant, afterQuant
    ]);
    await conn.commit();
    res.json({
      success: true,
      transferred: netAmt,
      fee,
      feeRate: withdrawFeeRate
    });
  } catch (err) {
    await conn.rollback();
    console.error("Transfer to fund error:", err);
    res.status(500).json({ error: "Transfer failed" });
  } finally {
    conn.release();
  }
});


module.exports = router;
