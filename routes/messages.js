///routes/messages.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔔 시스템 공지 목록

// helper: user_notices row 보장
async function ensureUserNotice(userId, noticeId) {
  await db.query(`
    INSERT INTO user_notices(user_id, notice_id)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE user_id=user_id
  `, [userId, noticeId]);
}

// ── 공지 조회 (유저별 삭제 필터 + 읽음 상태 표시) ───────────────────
// GET /api/messages/notices
router.get('/notices', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    const [rows] = await db.query(`
      SELECT
        n.id, n.title, n.body, n.created_at,
        COALESCE(un.is_read, 0)    AS is_read,
        COALESCE(un.is_deleted, 0) AS is_deleted
      FROM notices n
      LEFT JOIN user_notices un
        ON un.notice_id = n.id
       AND un.user_id = ?
      WHERE COALESCE(un.is_deleted, 0) = 0
      ORDER BY n.created_at DESC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error('❌ 공지 조회 오류:', err);
    res.status(500).json({ error: '공지 조회 실패' });
  }
});

// ── 공지 읽음 처리 ───────────────────
// PATCH /api/messages/notices/:id/read
router.patch('/notices/:id/read', async (req, res) => {
  const userId   = req.session.user?.id;
  const noticeId = req.params.id;
  if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    await ensureUserNotice(userId, noticeId);
    await db.query(`
      UPDATE user_notices
      SET is_read = 1, read_at = NOW()
      WHERE user_id = ? AND notice_id = ?
    `, [userId, noticeId]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 공지 읽음 처리 오류:', err);
    res.status(500).json({ error: '읽음 처리 실패' });
  }
});

// ── 공지 삭제 처리 ───────────────────
// DELETE /api/messages/notices/:id
router.delete('/notices/:id', async (req, res) => {
  const userId   = req.session.user?.id;
  const noticeId = req.params.id;
  if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    await ensureUserNotice(userId, noticeId);
    await db.query(`
      UPDATE user_notices
      SET is_deleted = 1, deleted_at = NOW()
      WHERE user_id = ? AND notice_id = ?
    `, [userId, noticeId]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 공지 삭제 처리 오류:', err);
    res.status(500).json({ error: '삭제 처리 실패' });
  }
});

// ── 공지 모두 읽음 ───────────────────
// PATCH /api/messages/notices/read-all
router.patch('/notices/read-all', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    // notice 전체에 대해 user_notices 생성 + 업데이트
    await db.query(`
      INSERT INTO user_notices(user_id, notice_id, is_read, read_at)
      SELECT ?, id, 1, NOW() FROM notices
      ON DUPLICATE KEY UPDATE is_read = 1, read_at = NOW()
    `, [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 공지 전체 읽음 오류:', err);
    res.status(500).json({ error: '전체 읽음 처리 실패' });
  }
});

// ── 공지 모두 삭제 ───────────────────
// DELETE /api/messages/notices
router.delete('/notices', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    // notice 전체에 대해 user_notices 생성 + 삭제 처리
    await db.query(`
      INSERT INTO user_notices(user_id, notice_id, is_deleted, deleted_at)
      SELECT ?, id, 1, NOW() FROM notices
      ON DUPLICATE KEY UPDATE is_deleted = 1, deleted_at = NOW()
    `, [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 공지 전체 삭제 오류:', err);
    res.status(500).json({ error: '전체 삭제 처리 실패' });
  }
});


// 📩 내 메시지 목록

// 📩 내 시스템 알림 목록
// GET /api/messages/inbox
router.get('/inbox', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    const [rows] = await db.query(
      `SELECT id, title, content, is_read, created_at
         FROM sys_messages
        WHERE user_id = ?
        ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ 시스템 알림 조회 오류:', err);
    res.status(500).json({ error: '조회 실패' });
  }
});

// ✉️ 개별 알림 읽음 처리
// PATCH /api/messages/inbox/:id/read
router.patch('/inbox/:id/read', async (req, res) => {
  const userId = req.session.user?.id;
  const msgId  = req.params.id;
  if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    await db.query(
      `UPDATE sys_messages
          SET is_read = 1
        WHERE id = ? AND user_id = ?`,
      [msgId, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 시스템 알림 읽음 처리 오류:', err);
    res.status(500).json({ error: '읽음 처리 실패' });
  }
});

// 🗑️ 개별 알림 삭제
// DELETE /api/messages/inbox/:id
router.delete('/inbox/:id', async (req, res) => {
  const userId = req.session.user?.id;
  const msgId  = req.params.id;
  if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    await db.query(
      `DELETE FROM sys_messages
        WHERE id = ? AND user_id = ?`,
      [msgId, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 시스템 알림 삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// 📖 전체 알림 읽음 처리
// PATCH /api/messages/inbox/read-all
router.patch('/inbox/read-all', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    await db.query(
      `UPDATE sys_messages
         SET is_read = 1
       WHERE user_id = ?`,
      [userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 전체 읽음 처리 오류:', err);
    res.status(500).json({ error: '전체 읽음 실패' });
  }
});

// 🗑️ 전체 알림 삭제
// DELETE /api/messages/inbox
router.delete('/inbox', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });

  try {
    await db.query(
      `DELETE FROM sys_messages
        WHERE user_id = ?`,
      [userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 전체 삭제 처리 오류:', err);
    res.status(500).json({ error: '전체 삭제 실패' });
  }
});


module.exports = router;
