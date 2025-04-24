const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const TronWeb = require("tronweb");
const { getTronWeb } = require("../models/tron");
const db = require("../db");

// ✅ 고유 추천 코드 생성 함수
async function generateReferralCode() {
  const charset = "0123456789ABCDEF";
  let code;
  let exists = true;
  while (exists) {
    code = Array.from({ length: 6 }, () =>
      charset[Math.floor(Math.random() * charset.length)]
    ).join("");
    const [rows] = await db.query(
      "SELECT id FROM users WHERE referral_code = ?", [code]
    );
    exists = rows.length > 0;
  }
  return code;
}

// ✅ 회원가입 API
router.post("/register", async (req, res) => {
  const { name, email, password, referral, captchaToken } = req.body;
  // 유효성 검사
  if (!name || /[^a-zA-Z0-9가-힣]/.test(name)) {
    return res.status(400).json({ error: "이름에 특수문자 불가" });
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "이메일 형식이 아님" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "비밀번호는 6자 이상" });
  }
  if (!captchaToken) {
    return res.status(400).json({ error: "CAPTCHA 인증 필요" });
  }

  // CAPTCHA 검증
  try {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
    const captchaRes = await fetch(verifyUrl, { method: "POST" });
    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      return res.status(403).json({ error: "CAPTCHA 인증 실패" });
    }
  } catch (captchaErr) {
    console.error(captchaErr);
    return res.status(500).json({ error: "CAPTCHA 검증 중 오류" });
  }

  try {
    // 이메일 중복 확인
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "이미 등록된 이메일입니다" });
    }

    // 추천 코드 처리
    let referrerId = null;
    let referralLevel = 1;
    if (referral) {
      const [refRows] = await db.query(
        "SELECT id, referral_level FROM users WHERE referral_code = ?",
        [referral]
      );
      if (refRows.length === 0) {
        return res.status(400).json({ error: "추천 코드가 유효하지 않습니다" });
      }
      referrerId = refRows[0].id;
      referralLevel = Math.min(refRows[0].referral_level + 1, 3);
    }

    // 비밀번호 해싱 및 사용자 생성
    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = await generateReferralCode();
    const [insertResult] = await db.query(
      "INSERT INTO users (name, email, password, referral_code, referrer_id, referral_level) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, referralCode, referrerId, referralLevel]
    );
    const newUserId = insertResult.insertId;

    // 추천 관계 및 히스토리 기록
    if (referrerId) {
      await db.query(
        "INSERT INTO referral_relations (referrer_id, referred_id, level) VALUES (?, ?, ?)",
        [referrerId, newUserId, referralLevel]
      );
      await db.query(
        "INSERT INTO referral_history (user_id, action, previous_level, new_level, metadata) VALUES (?, 'signup', NULL, ?, ?)",
        [newUserId, referralLevel, JSON.stringify({ referrerId })]
      );
    }

    // 지갑 생성 및 사용자 지갑에 키 저장
    const tron = getTronWeb();
    const account = await tron.createAccount();
    await db.query(
      "INSERT INTO wallets (user_id, address, private_key, quant_balance, fund_balance) VALUES (?, ?, ?, 0, 0)",
      [newUserId, account.address.base58, account.privateKey]
    );

    res.json({ message: "회원가입 완료", referralCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "회원가입 실패" });
  }
});

module.exports = router;
