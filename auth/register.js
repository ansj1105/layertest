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

// ▶ 회원가입 API
router.post("/register", async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    referral,
    captchaToken,
    nationality
  } = req.body;

  // 1) 기본 유효성 검사
  if (!name || /[^a-zA-Z0-9가-힣\s]/.test(name)) {
    return res.status(400).json({ error: "이름에 특수문자를 포함할 수 없습니다." });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "비밀번호는 6자 이상이어야 합니다." });
  }
  if (!captchaToken) {
    return res.status(400).json({ error: "CAPTCHA 인증이 필요합니다." });
  }
  if (!nationality) {
    return res.status(400).json({ error: "국적을 선택해주세요." });
  }

  // 2) 이메일/전화 방식 구분 & 검사
  let signupField, signupValue;
  if (email) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return res.status(400).json({ error: "올바른 이메일 형식이 아닙니다." });
    }
    signupField = "email"; signupValue = email;
  } else if (phone) {
    const phoneRe = /^\+\d{1,3}\s?\d{4,14}$/;
    if (!phoneRe.test(phone)) {
      return res.status(400).json({ error: "올바른 전화번호(국가번호 포함)가 아닙니다." });
    }
    signupField = "phone"; signupValue = phone;
  } else {
    return res.status(400).json({ error: "이메일 또는 전화번호 중 하나를 입력해주세요." });
  }

  // 3) CAPTCHA 서버 측 검증
  try {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify` +
                      `?secret=${process.env.RECAPTCHA_SECRET_KEY}` +
                      `&response=${captchaToken}`;
    const captchaRes = await fetch(verifyUrl, { method: "POST" });
    const { success } = await captchaRes.json();
    if (!success) {
      return res.status(403).json({ error: "CAPTCHA 인증에 실패했습니다." });
    }
  } catch (e) {
    console.error("CAPTCHA 검증 오류:", e);
    return res.status(500).json({ error: "CAPTCHA 검증 중 오류가 발생했습니다." });
  }

  try {
    // 4) 이메일/전화 중복 검사
    const [dup] = await db.query(
      `SELECT id FROM users WHERE ${signupField} = ?`,
      [signupValue]
    );
    if (dup.length > 0) {
      return res.status(409).json({ error: `${signupField === 'email' ? '이미 등록된 이메일' : '이미 등록된 전화번호'} 입니다.` });
    }

    // 5) 추천인 코드 처리
    let referrerId = null;
    if (referral) {
      const [refRows] = await db.query(`SELECT id FROM users WHERE referral_code = ?`, [referral]);
      if (refRows.length === 0) {
        return res.status(400).json({ error: "유효하지 않은 추천 코드입니다." });
      }
      referrerId = refRows[0].id;
    }

    // 6) 비밀번호 해싱
    const hashed = await bcrypt.hash(password, 10);

    // 7) 고유 추천 코드 생성
    const referralCode = await generateReferralCode();

    // 8) 사용자 생성
    const [result] = await db.query(
      `INSERT INTO users (name, email, phone, password, referral_code, referrer_id, nationality, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, email || null, phone || null, hashed, referralCode, referrerId, nationality]
    );
    const newUserId = result.insertId;

    // 9) 추천 관계 기록 (선택)
   // ✅ 추천 관계 삽입 (최대 3단계까지 자동 계층 기록)
   if (referrerId) {
    await db.query(`INSERT INTO referral_relations (referrer_id, referred_id, level, status, created_at)
                    VALUES (?, ?, ?, 'active', NOW())`, [referrerId, newUserId, 1]);

    const [parents] = await db.query(
      `SELECT referrer_id, level FROM referral_relations WHERE referred_id = ? AND level <= 2`,
      [referrerId]
    );

    for (const parent of parents) {
      await db.query(`INSERT INTO referral_relations (referrer_id, referred_id, level, status, created_at)
                      VALUES (?, ?, ?, 'active', NOW())`,
                      [parent.referrer_id, newUserId, parent.level + 1]);
    }
  }

    // 10) 지갑 생성
    const tron = require("../models/tron").getTronWeb();
    const account = await tron.createAccount();
    await db.query(
      `INSERT INTO wallets
         (user_id, address, private_key, quant_balance, fund_balance)
       VALUES (?, ?, ?, 0, 0)`,
      [newUserId, account.address.base58, account.privateKey]
    );

    return res.json({ success: true, message: "회원가입이 완료되었습니다.", referralCode });
  } catch (err) {
    console.error("회원가입 실패:", err);
    return res.status(500).json({ error: "서버 오류로 회원가입에 실패했습니다." });
  }
});

module.exports = router;
