const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetCode(to, code) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to: [to],
            subject: '[MyApp] 비밀번호 재설정 인증번호',
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

        if (error) {
            console.error('❌ Resend 이메일 전송 실패:', error);
            throw error;
        }

        console.log('✅ Resend 이메일 전송 성공:', to);
        return data;
    } catch (error) {
        console.error('❌ Resend 이메일 전송 오류:', error);
        throw error;
    }
}

async function sendVerificationCode(to, code, type) {
    const typeText = type === 'old' ? '확인' : type === 'new' ? '변경' : '인증';

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to: [to],
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

        if (error) {
            console.error('❌ Resend 인증 코드 전송 실패:', error);
            throw error;
        }

        console.log('✅ Resend 인증 코드 전송 성공:', to);
        return data;
    } catch (error) {
        console.error('❌ Resend 인증 코드 전송 오류:', error);
        throw error;
    }
}

module.exports = { sendResetCode, sendVerificationCode }; 