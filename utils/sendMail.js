const sgMail = require('@sendgrid/mail');

// SendGrid API 키 설정
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendResetCode(to, code) {
  const msg = {
    to: to,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
    subject: '[Dave] 비밀번호 재설정 인증번호',
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
  };

  try {
    await sgMail.send(msg);
    console.log('✅ SendGrid 이메일 전송 성공:', to);
  } catch (error) {
    console.error('❌ SendGrid 이메일 전송 실패:', error);
    throw error;
  }
}

module.exports = { sendResetCode };
