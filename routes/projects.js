// 📁 routes/projects.js

const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * ▶ 펀딩 프로젝트 상세 + 진행 현황 + 투자자 목록 조회
 * GET /api/projects/:id/summary
 */
router.get('/:id/summary', async (req, res) => {
  const { id } = req.params;
  console.log(`[Project Summary] Requested project id: ${id}`);

  try {
    // 1) 프로젝트 정보
    const [[proj]] = await db.query(
      `SELECT id, name, description,
              min_amount   AS minAmount,
              max_amount   AS maxAmount,
              target_amount AS targetAmount,
              daily_rate   AS dailyRate,
              cycle_days   AS cycle,
              start_date, end_date,
              min_participants AS minParticipants,
              status
       FROM funding_projects
       WHERE id = ?`,
      [id]
    );
    if (!proj) {
      console.warn(`[Project Summary] Project not found: id=${id}`);
      return res.status(404).json({ error: 'Project not found' });
    }

    // 2) 누적 투자액 집계
    const [[total]] = await db.query(
      `SELECT IFNULL(SUM(amount),0) AS totalInvested
       FROM funding_investments
       WHERE project_id = ?`,
      [id]
    );
    const currentAmount = parseFloat(total.totalInvested);
    console.log(`[Project Summary] currentAmount for id ${id}: ${currentAmount}`);

    // 3) 투자자 목록
    const [investors] = await db.query(
      `SELECT fi.id, u.id AS userId, u.email, fi.amount, fi.created_at
       FROM funding_investments fi
       JOIN users u ON fi.user_id = u.id
       WHERE fi.project_id = ?
       ORDER BY fi.created_at DESC`,
      [id]
    );

    // 응답
    res.json({
      project: proj,
      currentAmount,
      investors
    });
  } catch (err) {
    console.error(`[Project Summary] Error for id=${id}:`, err);
    res.status(500).json({ error: 'Summary fetch failed' });
  }
});


// GET /api/funding-investments
// Returns the current user's funding investments, newest first
router.get('/funding-investments', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const [rows] = await db.query(
      `SELECT
         fi.id,
         fi.project_id,
         fp.name            AS project_name,
         fi.amount,
         fi.profit,
         fi.created_at      AS createdAt
       FROM funding_investments fi
       JOIN funding_projects    fp ON fi.project_id = fp.id
       WHERE fi.user_id = ?
       ORDER BY fi.created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('❌ funding-investments error:', err);
    res.status(500).json({ success: false, error: 'funding-investments failed' });
  }
});
module.exports = router;
