// 📁 routes/security.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const sgMail = require('@sendgrid/mail');

// SendGrid API 키 설정
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 인증 코드 생성 함수
function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ▶ 인증 코드 발송
router.post('/email/send-code', async (req, res) => {
  console.log('[send-code] body:', req.body);
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      console.warn('[send-code] Unauthorized');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { email, type } = req.body;
    console.log('[send-code] email, type:', email, type);
    if (!email || !['old', 'new', 'trade'].includes(type)) {
      console.warn('[send-code] Invalid payload');
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    // 기존 이메일 검증 (old / trade)
    const [[me]] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
    console.log('[send-code] DB user email:', me?.email);
    if ((type === 'old' && me?.email !== email) ||
      (type === 'trade' && me?.email !== email)) {
      console.warn('[send-code] Email mismatch for type', type);
      return res.status(400).json({
        success: false, error: type === 'old'
          ? '기존 이메일이 일치하지 않습니다.'
          : '권한이 없습니다.'
      });
    }

    // 코드 생성 & DB 삽입
    const code = genCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    console.log('[send-code] generated code:', code, 'expiresAt:', expiresAt);
    await db.query(`
      INSERT INTO email_verifications (user_id, email, code, type, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, email, code, type, expiresAt]);

    // 메일 전송 (SendGrid 사용)
    const typeText = type === 'old' ? '확인' : type === 'new' ? '변경' : '인증';
    await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
      to: email,
      subject: '[Upstart] 이메일 인증 코드',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">이메일 ${typeText} 인증</h2>
          <p>아래 인증번호를 입력해 주세요:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; margin: 0; font-size: 32px;">${code}</h1>
          </div>
          <p style="color: #666;">인증번호는 10분 동안 유효합니다.</p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">이 이메일은 자동으로 발송되었습니다.</p>
        </div>
      `,
    });
    console.log('[send-code] Mail sent to', email);

    res.json({ success: true });
  } catch (err) {
    console.error('[send-code][Error]', err);
    res.status(500).json({ success: false, error: '메일 발송 중 오류가 발생했습니다.' });
  }
});

// ▶ 이메일 변경
router.post('/email/update', async (req, res) => {
  console.log('[email-update] body:', req.body);
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { oldCode, newEmail, newCode } = req.body;
    if (!oldCode || !newEmail || !newCode) {
      console.warn('[email-update] Invalid payload');
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    // oldCode 검증
    const [[oldRow]] = await db.query(`
      SELECT * FROM email_verifications
      WHERE user_id=? AND type='old' AND code=? AND used=0 AND expires_at>NOW()
    `, [userId, oldCode]);
    console.log('[email-update] oldRow:', oldRow);
    if (!oldRow) return res.status(400).json({ success: false, error: '기존 이메일 인증 실패' });

    // newCode 검증
    const [[newRow]] = await db.query(`
      SELECT * FROM email_verifications
      WHERE user_id=? AND type='new' AND email=? AND code=? AND used=0 AND expires_at>NOW()
    `, [userId, newEmail, newCode]);
    console.log('[email-update] newRow:', newRow);
    if (!newRow) return res.status(400).json({ success: false, error: '새 이메일 인증 실패' });

    // 이메일 업데이트
    await db.query('UPDATE users SET email=? WHERE id=?', [newEmail, userId]);
    console.log('[email-update] User email updated to', newEmail);

    // 코드 사용 처리
    await db.query('UPDATE email_verifications SET used=1 WHERE id IN (?,?)', [oldRow.id, newRow.id]);
    console.log('[email-update] Codes marked used:', oldRow.id, newRow.id);

    res.json({ success: true });
  } catch (err) {
    console.error('[email-update][Error]', err);
    res.status(500).json({ success: false, error: '이메일 변경 중 오류가 발생했습니다.' });
  }
});

// ▶ 거래 비밀번호 변경
router.post('/trade-password', async (req, res) => {
  console.log('[trade-password] body:', req.body);
  try {
    const userId = req.session.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { code, newPassword, confirmPassword } = req.body;
    if (!code || !newPassword || !confirmPassword) {
      console.warn('[trade-password] Invalid payload');
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }
    if (newPassword !== confirmPassword) {
      console.warn('[trade-password] Password mismatch');
      return res.status(400).json({ success: false, error: '비밀번호가 일치하지 않습니다.' });
    }
    if (newPassword.length < 6) {
      console.warn('[trade-password] Password too short');
      return res.status(400).json({ success: false, error: '6자 이상 입력하세요.' });
    }

    // 코드 검증
    const [[row]] = await db.query(`
      SELECT id FROM email_verifications
      WHERE user_id=? AND type='trade' AND code=? AND used=0 AND expires_at>NOW()
    `, [userId, code]);
    console.log('[trade-password] verification row:', row);
    if (!row) {
      return res.status(400).json({ success: false, error: '인증 코드가 유효하지 않습니다.' });
    }

    // 비밀번호 해싱 & 저장
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET trade_password=? WHERE id=?', [hash, userId]);
    console.log('[trade-password] Trade password updated for user', userId);

    // 코드 사용 처리
    await db.query('UPDATE email_verifications SET used=1 WHERE id=?', [row.id]);
    console.log('[trade-password] Code marked used:', row.id);

    res.json({ success: true });
  } catch (err) {
    console.error('[trade-password][Error]', err);
    res.status(500).json({ success: false, error: '거래 비밀번호 변경 중 오류가 발생했습니다.' });
  }
});
router.post('/password/change', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'PASSWORD_TOO_SHORT' });
  }

  try {
    // 1) 현재 해시된 비밀번호 조회
    const [[user]] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2) 비교
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ error: 'INVALID_OLD_PASSWORD' });
    }

    // 3) 해시 및 저장
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, userId]);

    res.json({ success: true });
  } catch (err) {
    console.error('❌ 비밀번호 변경 오류:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ▶ 비밀번호 재설정 이메일 인증코드 발송
router.post('/password/send-reset-code', async (req, res) => {
  console.log('[send-reset-code] body:', req.body);
  try {
    const { email } = req.body;
    if (!email) {
      console.warn('[send-reset-code] Invalid payload');
      return res.status(400).json({ success: false, error: '이메일을 입력해주세요.' });
    }

    // 사용자 확인
    const [[user]] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(404).json({ success: false, error: '등록되지 않은 이메일입니다.' });
    }

    // 코드 생성 & DB 삽입
    const code = genCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    console.log('[send-reset-code] generated code:', code, 'expiresAt:', expiresAt);

    await db.query(`
      INSERT INTO email_verifications (user_id, email, code, type, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `, [user.id, email, code, 'old', expiresAt]);

    // 메일 전송 (SendGrid 사용)
    await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
      to: email,
      subject: '[Upstart] 비밀번호 재설정 인증 코드',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">비밀번호 재설정 요청</h2>
          <p>아래 인증번호를 입력해 주세요:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; margin: 0; font-size: 32px;">${code}</h1>
          </div>
          <p style="color: #666;">인증번호는 10분 동안 유효합니다.</p>
          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">이 이메일은 자동으로 발송되었습니다.</p>
        </div>
      `,
    });
    console.log('[send-reset-code] Mail sent to', email);

    res.json({ success: true });
  } catch (err) {
    console.error('[send-reset-code][Error]', err);
    res.status(500).json({ success: false, error: '메일 발송 중 오류가 발생했습니다.' });
  }
});

// ▶ 이메일 인증 후 비밀번호 재설정
router.post('/password/reset', async (req, res) => {
  console.log('[password-reset] body:', req.body);
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      console.warn('[password-reset] Invalid payload');
      return res.status(400).json({
        success: false,
        error: '모든 필드를 입력해주세요.'
      });
    }

    if (newPassword.length < 6) {
      console.warn('[password-reset] Password too short');
      return res.status(400).json({
        success: false,
        error: '비밀번호는 최소 6자 이상이어야 합니다.'
      });
    }

    // 인증 코드 검증
    const [[verification]] = await db.query(`
      SELECT v.*, u.id as user_id 
      FROM email_verifications v
      JOIN users u ON u.email COLLATE utf8mb4_unicode_ci = v.email
      WHERE v.email = ? 
      AND v.code = ? 
      AND v.type = 'old'
      AND v.used = 0 
      AND v.expires_at > NOW()
    `, [email, code]);

    if (!verification) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 인증 코드입니다.'
      });
    }

    // 현재 비밀번호 가져오기
    const [[user]] = await db.query('SELECT password FROM users WHERE id = ?', [verification.user_id]);

    // 현재 비밀번호와 새 비밀번호가 같은지 확인
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: '현재 비밀번호와 동일한 비밀번호로 변경할 수 없습니다.'
      });
    }

    // 비밀번호 해시화 및 업데이트
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, verification.user_id]);

    // 인증 코드 사용 처리
    const now = new Date();
    await db.query('UPDATE email_verifications SET used = 1, used_at = ? WHERE id = ?',
      [now, verification.id]);

    res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (err) {
    console.error('[password-reset][Error]', err);
    res.status(500).json({
      success: false,
      error: '비밀번호 변경 중 오류가 발생했습니다.'
    });
  }
});

// ▶ 비밀번호 재설정 인증코드 검증
router.post('/password/verify-code', async (req, res) => {
  console.log('[verify-code] body:', req.body);
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, error: '이메일과 인증코드를 입력해주세요.' });
    }

    // 인증 코드 검증
    const [[verification]] = await db.query(`
      SELECT v.*, u.id as user_id 
      FROM email_verifications v
      JOIN users u ON u.email COLLATE utf8mb4_unicode_ci = v.email
      WHERE v.email = ? 
      AND v.code = ? 
      AND v.type = 'old'
      AND v.used = 0 
      AND v.expires_at > NOW()
    `, [email, code]);

    if (!verification) {
      return res.status(400).json({ success: false, error: '유효하지 않은 인증 코드입니다.' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[verify-code][Error]', err);
    res.status(500).json({ success: false, error: '인증 코드 확인 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
