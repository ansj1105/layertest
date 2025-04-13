// ✅ 회원가입 라우트 (auth/register.js)
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
// 📁 auth/register.js
const db = require("../db"); // 이미 사용 중이니까 그대로 두면 됨

// ✅ 회원가입 API
router.post("/register", async (req, res) => {
  const { name, email, password, referral, captchaToken } = req.body;

  // ✅ 유효성 검사
  if (!name || /[^a-zA-Z0-9가-힣]/.test(name)) {
    return res.status(400).json({ error: "❗ 이름에 특수문자 불가" });
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "❗ 이메일 형식이 아님" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "❗ 비밀번호는 6자 이상" });
  }
  if (!captchaToken) {
    return res.status(400).json({ error: "❗ CAPTCHA 인증 필요" });
  }

  // ✅ CAPTCHA 검증
  try {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
    const captchaRes = await fetch(verifyUrl, { method: "POST" });
    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      return res.status(403).json({ error: "❌ CAPTCHA 인증 실패" });
    }
  } catch (captchaErr) {
    console.error("❌ CAPTCHA 요청 에러:", captchaErr);
    return res.status(500).json({ error: "CAPTCHA 검증 중 오류" });
  }

  // ✅ 이메일 중복 검사
  try {
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "❗ 이미 등록된 이메일입니다" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, email, password, referral_code) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, referral || null]
    );

    return res.json({ message: "✅ 회원가입 완료" });
  } catch (err) {
    console.error("회원가입 에러:", err);
    return res.status(500).json({ error: "회원가입 실패" });
  }
});

module.exports = router;
