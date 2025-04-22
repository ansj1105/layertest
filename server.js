// 📁 server.js
require("dotenv").config();
const express = require("express");
const TronWeb = require("tronweb");
const cron = require('node-cron');
const mysql = require("mysql2/promise");
const cors = require("cors");
const axios = require("axios");
const session = require("express-session"); // ✅ 세션 추가
const app = express();
app.use(
    session({
      secret: process.env.SESSION_SECRET || "default_secret_key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,  //JS에서 쿠키 접근 금지 (보안 강화)
        secure: process.env.NODE_ENV === "production", // 배포 시에만 HTTPS 전용 쿠키 	HTTPS 환경에서만 쿠키를 전달
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CORS + 쿠키 지원용 CORS 요청에서도 쿠키 전달 허용 (프론트와 백엔드 도메인이 다를 경우
        maxAge: 1000 * 60 * 60 * 3, // 3시간
      },
    })
  );

  /*
  app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,          // ✅ HTTP에서도 쿠키 전달되도록 허용
      sameSite: "lax",        // ✅ 크로스 사이트에서 최소한의 쿠키 전달
      maxAge: 1000 * 60 * 60 * 3,
    },
  })
);

  */
const allowedOrigins = [
    'http://localhost:5173',         // 개발 환경
    'https://yourdomain.com',  
    'http://54.85.128.211:5173',
  ];
  
  app.use(
    cors({
     /* origin: function (origin, callback) {
        // 요청 origin이 허용된 도메인 목록에 있는 경우 허용
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("CORS 정책에 의해 차단됨"));
        }
      },*/
      origin: true,
      credentials: true,
    })
  );
  
app.use(express.json());

// ✅ DB 연결 설정
const db = require("./db"); // 이걸로 사용
// ✅ TronWeb 인스턴스 (기본 읽기용)
const getTronWeb = (privateKey = null) => {
    const address = process.env.TRON_DEFAULT_ADDRESS || "TTa5UgnnyRaBFPiXKMzSxNztMFbbnDQ1Dd";
  
    const options = {
      fullHost: "https://api.trongrid.io",
      headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY },
      address, // ✅ 이 라인이 핵심! (base58 주소)
    };
  
    if (privateKey) {
      options.privateKey = privateKey;
    }
  
    return new TronWeb(options);
  };
  
  const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
  const authRoutes = require('./auth/register'); //회원가입 및 토큰처리   
  const loginRoutes = require('./auth/login');//로그인 라우터
  const contentRoutes = require('./routes/content');
  const adminUserRoutes = require('./routes/adminUsers');
  const messageRoutes = require('./routes/messages');
  const popupMessageRoutes = require('./routes/popupMessages');
  const referralRoutes = require('./routes/referral');
  // 상단 import 구역에 추가
const quantTradeRoutes = require('./routes/quanttrade');
const tokenRoutes = require('./routes/token'); // ✅ QVC 토큰 관련 라우터
app.use('/api/token', tokenRoutes);

const { router: vipLevelRoutes } = require('./routes/vipLevels'); // ✅ router만 불러오기
app.use('/api/admin/vip-levels', vipLevelRoutes);

const { getNewVipLevel } = require('./routes/vipLevels'); // 함수 가져오기

app.use('/api', quantTradeRoutes);
app.use('/api/referral', referralRoutes);

app.use('/api/popups', popupMessageRoutes);
app.use('/api/messages', messageRoutes);  
  app.use('/api/admin', adminUserRoutes);
  app.use('/api', contentRoutes);
  app.use('/api/auth', loginRoutes); // ✅ 같은 prefix로 라우터 추가 등록 가능
app.use('/api/auth', authRoutes);
  // ✅ 1. 지갑 생성 API
  app.get("/api/create-wallet", async (req, res) => {
    try {
      const tronWeb = getTronWeb();
      const account = await tronWeb.createAccount();
  
      await db.query(
        "INSERT INTO wallet_log (address, private_key) VALUES (?, ?)",
        [account.address.base58, account.privateKey]
      );
  
      res.json({
        address: account.address.base58,
        privateKey: account.privateKey,
      });
    } catch (err) {
      handleError(res, "Wallet creation failed", err);
    }
  });
  
  // ✅ 2. 잔액 조회 API
// ✅ 수정된 /api/get-balance API (Tronscan API 활용)


// ✅ 수정된 /api/get-balance API (Tronscan API 활용)

// ✅ 간단한 API 엔드포인트
app.get('/api/ping', (req, res) => {
  console.log("✅ [백엔드] 클라이언트로부터 ping 수신!");
  res.json({ message: "pong from server!" });
});
app.get("/api/get-balance", async (req, res) => {
  const address = req.query.address?.trim();
  console.log("📥 [잔액 조회 요청] address param:", address);

  if (!address || !/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
    console.warn("❗ 유효하지 않은 주소:", address);
    return res.status(400).json({ error: "Invalid TRON address" });
  }

  try {
    const response = await axios.get("https://apilist.tronscanapi.com/api/accountv2", {
      params: { address },
      headers: {
        "TRON-PRO-API-KEY": process.env.TRON_API_KEY2,
      },
    });

    console.log("🧾 [Tronscan API 전체 응답]:");
    console.dir(response.data, { depth: null });

    const usdtAsset = response.data.withPriceTokens?.find(
      (token) => token.tokenId === "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" // USDT 실제 계약 주소
    );

    const balance = usdtAsset ? (Number(usdtAsset.balance) / 1e6).toFixed(6) : "0.000000";
    console.log(`✅ [Tronscan 조회 완료] ${address}: ${balance} USDT`);

    try {
      await db.query(
        "INSERT INTO balance_log (address, balance_usdt) VALUES (?, ?)",
        [address, balance]
      );
      console.log("📝 [DB 기록 완료]");
    } catch (dbErr) {
      console.warn("⚠️ [DB 기록 실패]:", dbErr.message);
    }

    res.json({ usdt: balance });
  } catch (err) {
    console.error("❌ [ERROR] Tronscan API 호출 실패:", err.message);
    res.status(500).json({ error: "Tronscan balance check failed", details: err.message });
  }
});

  
  // ✅ 3. 송금 API
  app.post("/api/send-usdt", async (req, res) => {
    const { fromPrivateKey, toAddress, amount } = req.body;
  
    console.log("📨 [송금 요청]");
    console.log("🔑 fromPrivateKey:", fromPrivateKey?.slice(0, 10) + '...');
    console.log("📬 toAddress:", toAddress);
    console.log("💸 amount:", amount);
  
    try {
      // 주소 유효성 검사
      const tronWeb = getTronWeb(fromPrivateKey);
      const isValid = tronWeb.isAddress(toAddress);
      console.log("✅ 주소 유효성 검사:", isValid);
  
      if (!isValid) {
        console.warn("❗ 잘못된 주소:", toAddress);
        return res.status(400).json({ error: "Invalid TRON address" });
      }
  
      const contract = await tronWeb.contract().at(USDT_CONTRACT);
      const tx = await contract.methods.transfer(toAddress, amount * 1e6).send();
  
      const fromAddress = tronWeb.address.fromPrivateKey(fromPrivateKey);
  
      await db.query(
        "INSERT INTO transaction_log (from_address, to_address, amount_usdt, tx_hash) VALUES (?, ?, ?, ?)",
        [fromAddress, toAddress, amount, tx]
      );
  
      console.log("✅ 전송 완료:", tx);
      res.json({ txHash: tx });
  
    } catch (err) {
      console.error("❌ 송금 중 에러 발생:", err.message);
  
      await db.query(
        "INSERT INTO transaction_log (from_address, to_address, amount_usdt, status) VALUES (?, ?, ?, ?)",
        ["unknown", toAddress, amount, "failed"]
      );
  
      handleError(res, "USDT transfer failed", err);
    }
  });
  
  
  // ✅ 4. 트랜잭션 로그 조회 API
  app.get("/api/transactions", async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM transaction_log ORDER BY id DESC LIMIT 50");
      res.json(rows);
    } catch (err) {
      handleError(res, "Failed to fetch transactions", err);
    }
  });
  
  // ✅ 공통 에러 핸들러
  function handleError(res, msg, err) {
    console.error(`❌ [ERROR] ${msg}`);
    console.error("▶ FULL ERROR:", err);
  
    res.status(500).json({
      error: msg,
      ...(process.env.NODE_ENV === "development" && {
        debug: {
          message: err?.message,
          stack: err?.stack,
          errorObject: err,
        },
      }),
    });
  }
  //코인정보 달라하기 api~!
  app.get('/api/market-data', async (req, res) => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            ids: 'bitcoin,ethereum,binancecoin,ripple,solana,polkadot,litecoin,chainlink,cardano'
          }
        }
      );
      res.json(response.data);
    } catch (err) {
      console.error("❌ CoinGecko 호출 실패:", err.message);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });
// 1시간마다 VIP 레벨 자동 갱신
cron.schedule('0 * * * *', async () => {
  console.log("⏰ [CRON] VIP 레벨 갱신 시작");

  try {
    const [users] = await db.query('SELECT id, usdt_balance FROM users');

    for (const user of users) {
      // A, B, C 추천인 수 집계
      const [[counts]] = await db.query(`
        SELECT
          SUM(CASE WHEN level = 1 THEN 1 ELSE 0 END) AS A,
          SUM(CASE WHEN level = 2 THEN 1 ELSE 0 END) AS B,
          SUM(CASE WHEN level = 3 THEN 1 ELSE 0 END) AS C
        FROM referral_relations
        WHERE referrer_id = ?
      `, [user.id]);

      const newLevel = await getNewVipLevel(user.usdt_balance, counts, db);

      // 현재 등급과 다를 경우 업데이트
      await db.query('UPDATE users SET vip_level = ? WHERE id = ?', [newLevel, user.id]);
    }

    console.log("✅ [CRON] VIP 레벨 갱신 완료");
  } catch (err) {
    console.error("❌ [CRON ERROR] VIP 갱신 실패:", err.message);
  }
});
  // ✅ 서버 실행
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  // ✅ DB 연결 테스트 로그
db.query('SELECT DATABASE() AS db')
.then(([rows]) => {
  console.log(`✅ DB 연결 확인: 현재 연결된 DB - ${rows[0].db}`);
})
.catch((err) => {
  console.error('❌ DB 연결 실패:', err.message);
});