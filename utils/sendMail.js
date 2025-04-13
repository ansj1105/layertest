const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // 또는 'naver'
  auth: {
    user: process.env.MAIL_USER,     // 예: myemail@gmail.com
    pass: process.env.MAIL_PASS,     // 앱 비밀번호 또는 SMTP 비밀번호
  },
});

async function sendResetCode(to, code) {
  const mailOptions = {
    from: `"MyApp Support" <${process.env.MAIL_USER}>`,
    to,
    subject: '[MyApp] 비밀번호 재설정 인증번호',
    html: `
      <h3>비밀번호 재설정 요청</h3>
      <p>아래 인증번호를 입력해 주세요:</p>
      <h2 style="color:#3366cc;">${code}</h2>
      <p>인증번호는 10분 동안 유효합니다.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendResetCode };
