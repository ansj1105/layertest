// 📁 server.js
require("dotenv").config();
const express = require("express");
const TronWeb = require("tronweb");
const cron = require('node-cron');
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require('path');
const axios = require("axios");
const session = require("express-session"); // ✅ 세션 추가
const { calculateFundingProfits } = require('./routes/fundingProfit');
const { accrueDailyProfits, handleProjectExpiry } = require('./schedulers/projectScheduler');

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

  const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
  const authRoutes = require('./auth/register'); //회원가입 및 토큰처리   
  const loginRoutes = require('./auth/login');//로그인 라우터
  const contentRoutes = require('./routes/content');
  app.use('/api', contentRoutes );
  const adminUserRoutes = require('./routes/adminUsers');
  const messageRoutes = require('./routes/messages');
  const popupMessageRoutes = require('./routes/popupMessages');
  const referralRoutes = require('./routes/referral');
  // 상단 import 구역에 추가
const quantTradeRoutes = require('./routes/quanttrade');
const tokenRoutes = require('./routes/token'); // ✅ QVC 토큰 관련 라우터
const rechargeRoutes = require('./routes/recharge'); //코인충전관련
const mydataRoutes = require('./routes/mydata');
const logsRoutes = require('./routes/logs');
const chatRoutes = require('./routes/chat');
const { authenticateToken, isChatAdmin } = require('./middleware/auth');
const { loginRouter, router: chatRouter, wss } = chatRoutes;


// 로그인 라우트만 별도 등록 (라우터 인스턴스이므로 OK)
app.use('/api/chat', chatRouter); // 인증 필요하면 미들웨어 추가
app.use('/api/chat/admin/login', loginRouter); // 인증 없이

const projectsRoutes = require('./routes/projects');
app.use('/api/projects', projectsRoutes);
app.use('/api/mydata', mydataRoutes);
app.use('/api/logs', logsRoutes);

 app.use('/api/recharge', rechargeRoutes);
app.use('/api/token', tokenRoutes);
// 상단 import
const adminInviteRewards = require('./routes/admininviteRewards');
// 관리자용 엔드포인트
app.use('/api/admin/invite-rewards', adminInviteRewards);
const adminJoinRoutes = require('./routes/adminJoinRewards');
app.use('/api/admin/join-rewards', adminJoinRoutes);

const { router: vipLevelRoutes } = require('./routes/vipLevels'); // ✅ router만 불러오기
app.use('/api/admin/vip-levels', vipLevelRoutes);
const securityRoutes = require('./routes/security');
app.use('/api/security', securityRoutes);
const { getNewVipLevel } = require('./routes/vipLevels'); // 함수 가져오기
const tokensRouter = require('./routes/admintoken');
app.use('/api/admin/tokens', tokensRouter);
const walletRoutes = require('./routes/wallet');

const withdrawalsRouter = require('./routes/withdrawals');
app.use('/api/withdrawals', withdrawalsRouter);
app.use('/api/wallet', walletRoutes);
app.use('/api', quantTradeRoutes);
app.use('/api/referral', referralRoutes);
const { router: tronRouter } = require('./routes/tron');
app.use('/api/tron', tronRouter);
app.use('/api/popups', popupMessageRoutes);
app.use('/api/messages', messageRoutes);  
  app.use('/api/admin', adminUserRoutes);
 
  app.use('/api/auth', loginRoutes); // ✅ 같은 prefix로 라우터 추가 등록 가능
app.use('/api/auth', authRoutes);
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'public', 'uploads'))
);//업로드 경로로

  // ✅ 간단한 API 엔드포인트
app.get('/api/ping', (req, res) => {
  console.log("✅ [백엔드] 클라이언트로부터 ping 수신!");
  res.json({ message: "pong from server!" });
});

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
// 1️⃣ 기존 CRON 코드 안의 로직을 함수로 추출
// 1️⃣ 기존 CRON 코드 안의 로직을 함수로 추출
async function runVipUpdateJob() {
  console.log("⏰ [CRON] VIP 레벨 갱신 시작");

  try {
    const [users] = await db.query('SELECT id, vip_level FROM users');

    for (const user of users) {
      const userId = user.id;
      const currentVip = user.vip_level;

      // 2️⃣ 하위 추천인 수 조회
      const [[counts]] = await db.query(`
        SELECT
          SUM(CASE WHEN level = 1 THEN 1 ELSE 0 END) AS A,
          SUM(CASE WHEN level = 2 THEN 1 ELSE 0 END) AS B,
          SUM(CASE WHEN level = 3 THEN 1 ELSE 0 END) AS C
        FROM referral_relations
        WHERE referrer_id = ? AND status = 'active'
      `, [userId]);

      const A = counts.A || 0;
      const B = counts.B || 0;
      const C = counts.C || 0;

      console.log(`👤 [User ${userId}] 현재 VIP: ${currentVip}, 하위추천 A:${A}, B:${B}, C:${C}`);

      // 3️⃣ VIP 조건에 맞는 최고 등급 찾기
      const [levels] = await db.query(`
        SELECT level
        FROM vip_levels
        WHERE min_A <= ? AND min_B <= ? AND min_C <= ?
        ORDER BY level DESC
        LIMIT 1
      `, [A, B, C]);

      const newLevel = levels.length ? levels[0].level : 1;

      if (newLevel !== currentVip) {
        await db.query(`UPDATE users SET vip_level = ? WHERE id = ?`, [newLevel, userId]);
        console.log(`✅ [User ${userId}] VIP 레벨 갱신: ${currentVip} → ${newLevel}`);
      } else {
        console.log(`🟡 [User ${userId}] VIP 유지: ${currentVip}`);
      }
    }

    console.log("✅ [CRON] VIP 레벨 갱신 완료");
  } catch (err) {
    console.error("❌ [CRON ERROR] VIP 갱신 실패:", err.message);
  }
}

  // 3️⃣ 서버 시작할 때 테스트 실행
runVipUpdateJob(); //레벨정산
accrueDailyProfits(); //펀딩수익정산
handleProjectExpiry(); //만료 정산

// 1시간마다 VIP 레벨 자동 갱신

//펀딩수익 스케쥴러
// 테스트 실행: 서버 시작 시 1회 실행
cron.schedule('0 0 * * *', async () => {
  console.log("⏰ [CRON] 펀딩 수익 정산 시작");
  try {
    await calculateFundingProfits();
    console.log("✅ [CRON] 펀딩 수익 정산 완료");
  } catch (err) {
    console.error("❌ [CRON] 펀딩 수익 정산 실패:", err.message);
  }
});

cron.schedule('0 * * * *', async () => {
  console.log("⏰ [CRON] VIP 레벨 갱신 시작");

  try {
    // 모든 유저 조회
    const [users] = await db.query('SELECT id FROM users');

    for (const user of users) {
      const userId = user.id;

      // 하위 추천인 수 계산 (A: level=1, B: level=2, C: level=3)
      const [[counts]] = await db.query(`
        SELECT
          SUM(CASE WHEN level = 1 THEN 1 ELSE 0 END) AS A,
          SUM(CASE WHEN level = 2 THEN 1 ELSE 0 END) AS B,
          SUM(CASE WHEN level = 3 THEN 1 ELSE 0 END) AS C
        FROM referral_relations
        WHERE referrer_id = ? AND status = 'active'
      `, [userId]);

      const A = counts.A || 0;
      const B = counts.B || 0;
      const C = counts.C || 0;

      // 조건을 만족하는 최고 등급 조회
      const [levels] = await db.query(`
        SELECT level
        FROM vip_levels
        WHERE min_A <= ? AND min_B <= ? AND min_C <= ?
        ORDER BY level DESC
        LIMIT 1
      `, [A, B, C]);

      const newLevel = levels.length ? levels[0].level : 1;

      // VIP 레벨 업데이트
      await db.query(`UPDATE users SET vip_level = ? WHERE id = ?`, [newLevel, userId]);
    }

    console.log("✅ [CRON] VIP 레벨 갱신 완료");
  } catch (err) {
    console.error("❌ [CRON ERROR] VIP 갱신 실패:", err.message);
  }
});
  // ✅ 서버 실행
  const server = app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port ${process.env.PORT || 4000}`);
  });

  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
    console.log('WebSocket upgrade request:', { 
      pathname, 
      headers: request.headers,
      url: request.url 
    });

    if (pathname === '/chat') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        console.log('WebSocket connection established');
        wss.emit('connection', ws, request);
      });
    } else {
      console.log('WebSocket upgrade rejected - invalid path:', pathname);
      socket.destroy();
    }
  });

  // WebSocket 서버 이벤트 로깅 추가
  wss.on('connection', async (ws, req) => {
    console.log('New WebSocket connection attempt');
    
    const isAuthenticated = await authenticateWebSocket(ws, req);
    if (!isAuthenticated) {
      console.log('WebSocket authentication failed');
      ws.close();
      return;
    }

    console.log('WebSocket authenticated successfully');
    const { userId, isAdmin, isGuest, guestId } = req.user;
    
    if (isAdmin) {
      adminClients.set(userId, ws);
      console.log('Admin client connected:', userId);
    } else if (isGuest) {
      guestClients.set(guestId, ws);
      console.log('Guest client connected:', guestId);
    } else {
      clients.set(userId, ws);
      console.log('User client connected:', userId);
    }

    ws.on('message', async raw => {
      try {
        console.log('Received WebSocket message:', raw.toString());
        const data = JSON.parse(raw);
        
        if (data.type === 'init') {
          console.log('Client initialization:', data);
          return;
        }
        
        switch (data.type) {
          case 'chat':
            console.log('Processing chat message:', data);
            await handleChatMessage(data, req.user);
            break;
          case 'typing':
            console.log('Processing typing status:', data);
            handleTypingStatus(data, req.user);
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      if (isAdmin) {
        adminClients.delete(userId);
        console.log('Admin client disconnected:', userId);
      } else if (isGuest) {
        guestClients.delete(guestId);
        console.log('Guest client disconnected:', guestId);
      } else {
        clients.delete(userId);
        console.log('User client disconnected:', userId);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // ✅ DB 연결 테스트 로그
db.query('SELECT DATABASE() AS db')
.then(([rows]) => {
  console.log(`✅ DB 연결 확인: 현재 연결된 DB - ${rows[0].db}`);
})
.catch((err) => {
  console.error('❌ DB 연결 실패:', err.message);
});

