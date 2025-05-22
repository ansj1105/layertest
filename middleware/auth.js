const jwt = require('jsonwebtoken');
const pool = require('../db');
const session = require('express-session');
const fs = require('fs');

// 서버에서 사용한 세션 스토어를 불러옵니다 (server.js에서 app.use(session({ store }))에 사용한 store 인스턴스)
// MemoryStore 예시 (실제 서비스에서는 RedisStore 등으로 교체)
let sessionStore;
try {
  // server.js에서 세션 스토어를 별도 파일로 export한 경우 require로 불러올 수 있음
  sessionStore = require('../sessionStore');
} catch (e) {
  // fallback: express-session의 기본 MemoryStore 사용
  sessionStore = new session.MemoryStore();
}

// JWT 토큰 검증 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// 관리자 권한 체크 미들웨어
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// 채팅 관리자 권한 체크 미들웨어
const isChatAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Chat admin access required' });
    }

    // DB에서 채팅 관리자 권한 확인
    const result = await pool.query(
      'SELECT * FROM chat_admins WHERE id = $1 AND is_active = true',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Not a chat admin' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// WebSocket 인증 미들웨어 (세션 기반)
const authenticateWebSocket = async (ws, req) => {
  // 1. 쿠키에서 connect.sid 추출
  const cookie = req.headers.cookie;
  if (!cookie) return false;
  const sidMatch = cookie.match(/connect\.sid=s%3A([^.;]+)[.;]?/);
  if (!sidMatch) return false;
  const sid = 's:' + sidMatch[1];

  // 2. 세션 스토어에서 세션 조회
  return new Promise((resolve) => {
    sessionStore.get(sid, (err, session) => {
      if (err || !session || !session.user) {
        resolve(false);
      } else {
        req.user = {
          userId: session.user.id,
          isAdmin: session.user.isAdmin,
          isGuest: false
        };
        resolve(true);
      }
    });
  });
};

// 채팅방 접근 권한 체크 미들웨어
const checkChatRoomAccess = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.isAdmin;
    const guestId = req.user?.guestId;

    // 채팅방 정보 조회
    const result = await pool.query(
      'SELECT * FROM chat_rooms WHERE id = $1',
      [roomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Chat room not found' });
    }

    const room = result.rows[0];

    // 권한 체크
    if (isAdmin) {
      // 관리자는 모든 채팅방 접근 가능
      next();
    } else if (userId && room.user_id === userId) {
      // 회원은 자신의 채팅방만 접근 가능
      next();
    } else if (guestId && room.guest_id === guestId) {
      // 비회원은 자신의 채팅방만 접근 가능
      next();
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
  isChatAdmin,
  authenticateWebSocket,
  checkChatRoomAccess
}; 