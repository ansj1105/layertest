const express = require('express');
const router  = express.Router();
const db      = require('../db');

// 유저별 지갑 잔액 조회
router.get('/wallets', async (req, res) => {
  const userId = req.session.user.id;
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 접근 가능합니다.' });
  }
  const [rows] = await db.query(`
    SELECT 
      user_id,
      SUM(fund_balance) as total_fund_balance,
      SUM(real_amount) as total_real_amount,
      SUM(quant_balance) as total_quant_balance
    FROM wallets
    GROUP BY user_id
  `);
  res.json({ success: true, data: rows });
});

// 총 유저 집계 지갑 잔액 조회
router.get('/wallets/total', async (req, res) => {
  const userId = req.session.user.id;
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 접근 가능합니다.' });
  }
  const [rows] = await db.query(`
    SELECT 
      SUM(fund_balance) as total_fund_balance,
      SUM(real_amount) as total_real_amount,
      SUM(quant_balance) as total_quant_balance
    FROM wallets
  `);
  res.json({ success: true, data: rows[0] });
});

// 오늘 가입한 회원과 총 가입한 회원 조회
router.get('/users', async (req, res) => {
  const userId = req.session.user.id;
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 접근 가능합니다.' });
  }
  const today = new Date().toISOString().split('T')[0];
  const [todayUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?', [today]);
  const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
  res.json({ success: true, today: todayUsers[0].count, total: totalUsers[0].count });
});

// 오늘 출금/입금과 총 출금/입금 합계 조회
router.get('/withdrawals', async (req, res) => {
  const userId = req.session.user.id;
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 접근 가능합니다.' });
  }
  const { user_id } = req.query;
  const today = new Date().toISOString().split('T')[0];
  const [todayWithdrawals] = await db.query(`
    SELECT 
      SUM(CASE WHEN flow_type = 'WITHDRAWAL' THEN amount ELSE 0 END) as today_withdrawal,
      SUM(CASE WHEN flow_type = 'DEPOSIT' THEN amount ELSE 0 END) as today_deposit
    FROM withdrawals
    WHERE status = 'SUCCESS' AND DATE(created_at) = ? ${user_id ? 'AND user_id = ?' : ''}
  `, user_id ? [today, user_id] : [today]);
  const [totalWithdrawals] = await db.query(`
    SELECT 
      SUM(CASE WHEN flow_type = 'WITHDRAWAL' THEN amount ELSE 0 END) as total_withdrawal,
      SUM(CASE WHEN flow_type = 'DEPOSIT' THEN amount ELSE 0 END) as total_deposit
    FROM withdrawals
    WHERE status = 'SUCCESS' ${user_id ? 'AND user_id = ?' : ''}
  `, user_id ? [user_id] : []);
  res.json({ 
    success: true, 
    today: todayWithdrawals[0], 
    total: totalWithdrawals[0] 
  });
});

// 오늘 총 수익, type 구분 조회
router.get('/quant-profits/today', async (req, res) => {
  const userId = req.session.user.id;
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 접근 가능합니다.' });
  }
  const today = new Date().toISOString().split('T')[0];
  const [todayProfits] = await db.query(`
    SELECT 
      IFNULL(SUM(amount), 0) as total_amount,
      IFNULL(SUM(CASE WHEN type = 'trade' THEN amount ELSE 0 END), 0) as trade_amount,
      IFNULL(SUM(CASE WHEN type = 'referral' THEN amount ELSE 0 END), 0) as referral_amount
    FROM quant_profits
    WHERE DATE(created_at) = ?
  `, [today]);
  res.json({ success: true, today: todayProfits[0] });
});

// 전체 총 수익, type 구분 조회
router.get('/quant-profits/total', async (req, res) => {
  const userId = req.session.user.id;
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 접근 가능합니다.' });
  }
  const [totalProfits] = await db.query(`
    SELECT 
      IFNULL(SUM(amount), 0) as total_amount,
      IFNULL(SUM(CASE WHEN type = 'trade' THEN amount ELSE 0 END), 0) as trade_amount,
      IFNULL(SUM(CASE WHEN type = 'referral' THEN amount ELSE 0 END), 0) as referral_amount
    FROM quant_profits
  `);
  res.json({ success: true, total: totalProfits[0] });
});

// user_id별 수익, type 구분 조회
router.get('/quant-profits/users', async (req, res) => {
  const userId = req.session.user.id;
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 접근 가능합니다.' });
  }
  const [userProfits] = await db.query(`
    SELECT 
      user_id,
      IFNULL(SUM(amount), 0) as total_amount,
      IFNULL(SUM(CASE WHEN type = 'trade' THEN amount ELSE 0 END), 0) as trade_amount,
      IFNULL(SUM(CASE WHEN type = 'referral' THEN amount ELSE 0 END), 0) as referral_amount
    FROM quant_profits
    GROUP BY user_id
  `);
  res.json({ success: true, users: userProfits });
});

// 오늘 총 투자금액, 수익금액 조회
router.get('/funding-investments/today', async (req, res) => {
  const userId = req.session.user.id;
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 접근 가능합니다.' });
  }
  const today = new Date().toISOString().split('T')[0];
  const [todayInvestments] = await db.query(`
    SELECT 
      IFNULL(SUM(amount), 0) as total_amount,
      IFNULL(SUM(profit), 0) as total_profit
    FROM funding_investments
    WHERE DATE(created_at) = ?
  `, [today]);
  //console.log('[funding-investments/today] todayInvestments:', todayInvestments);
  res.json({ success: true, today: todayInvestments[0] });
});

// 전체 총 투자금액, 수익금액 조회
router.get('/funding-investments/total', async (req, res) => {
  const userId = req.session.user.id;
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 접근 가능합니다.' });
  }
  const [totalInvestments] = await db.query(`
    SELECT 
      IFNULL(SUM(amount), 0) as total_amount,
      IFNULL(SUM(profit), 0) as total_profit
    FROM funding_investments
  `);
  //console.log('[funding-investments/total] totalInvestments:', totalInvestments);
  res.json({ success: true, total: totalInvestments[0] });
});

// user_id별 투자금액, 수익금액 조회
router.get('/funding-investments/users', async (req, res) => {
  const userId = req.session.user.id;
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 접근 가능합니다.' });
  }
  const [userInvestments] = await db.query(`
    SELECT 
      user_id,
      IFNULL(SUM(amount), 0) as total_amount,
      IFNULL(SUM(profit), 0) as total_profit
    FROM funding_investments
    GROUP BY user_id
  `);
  //console.log('[funding-investments/users] userInvestments:', userInvestments);
  res.json({ success: true, users: userInvestments });
});

// 유저 리스트 (검색/페이지네이션)
router.get('/users/list', async (req, res) => {
  const userId = req.session.user.id;
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 접근 가능합니다.' });
  }
  const { search = '', page = 1, pageSize = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(pageSize);
  let where = 'WHERE 1=1';
  let params = [];
  if (search) {
    where += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  // 유저 정보 + 지갑 잔액(합산) LEFT JOIN
  const [users] = await db.query(
    `SELECT u.id, u.name, u.email, u.phone, u.created_at,
            IFNULL(SUM(w.real_amount),0) as real_amount,
            IFNULL(SUM(w.fund_balance),0) as fund_balance,
            IFNULL(SUM(w.quant_balance),0) as quant_balance
     FROM users u
     LEFT JOIN wallets w ON w.user_id = u.id
     ${where}
     GROUP BY u.id
     ORDER BY u.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  );
  // 전체 카운트 (검색조건 동일, GROUP BY 없이)
  const [[{ count }]] = await db.query(
    `SELECT COUNT(*) as count FROM users u ${where}`,
    params
  );
  res.json({ users, total: count });
});

// 일별 가입/입금/출금/수익 추이 (최근 14일)
router.get('/stats/daily', async (req, res) => {
  const userId = req.session.user.id;
  if (!req.session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '관리자만 접근 가능합니다.' });
  }
  // 쿼리 파라미터로 날짜 범위 받기
  const { startDate, endDate } = req.query;
  let start = startDate || (() => { const d = new Date(); d.setDate(d.getDate() - 13); return d.toISOString().slice(0, 10); })();
  let end = endDate || (new Date().toISOString().slice(0, 10));
  // 날짜 라벨 생성
  const days = [];
  let cur = new Date(start);
  const endObj = new Date(end);
  while (cur <= endObj) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  // 가입자
  const [signupRows] = await db.query(
    `SELECT DATE(created_at) as d, COUNT(*) as cnt FROM users WHERE DATE(created_at) BETWEEN ? AND ? GROUP BY d`, [start, end]
  );
  // 입금/출금
  const [depositRows] = await db.query(
    `SELECT DATE(created_at) as d, flow_type, SUM(amount) as amt FROM withdrawals WHERE status='SUCCESS' AND DATE(created_at) BETWEEN ? AND ? GROUP BY d, flow_type`, [start, end]
  );
  // 수익 (quant + funding profit)
  const [quantRows] = await db.query(
    `SELECT DATE(created_at) as d, SUM(amount) as amt FROM quant_profits WHERE DATE(created_at) BETWEEN ? AND ? GROUP BY d`, [start, end]
  );
  const [fundingRows] = await db.query(
    `SELECT DATE(created_at) as d, SUM(profit) as amt FROM funding_investments WHERE DATE(created_at) BETWEEN ? AND ? GROUP BY d`, [start, end]
  );
  const toDateString = d => new Date(d).toISOString().slice(0, 10);
  const signup = days.map(day => Number(signupRows.find(r => toDateString(r.d) === day)?.cnt || 0));
  const deposit = days.map(day => Number(depositRows.find(r => toDateString(r.d) === day && r.flow_type === 'DEPOSIT')?.amt || 0));
  const withdrawal = days.map(day => Number(depositRows.find(r => toDateString(r.d) === day && r.flow_type === 'WITHDRAWAL')?.amt || 0));
  const profit = days.map(day => {
    const q = Number(quantRows.find(r => toDateString(r.d) === day)?.amt || 0);
    const f = Number(fundingRows.find(r => toDateString(r.d) === day)?.amt || 0);
    return q + f;
  });
  res.json({ labels: days, signup, deposit, withdrawal, profit });
});

module.exports = router;