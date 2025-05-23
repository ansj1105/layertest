const jwt = require('jsonwebtoken');
const pool = require('../db');
const session = require('express-session');
const fs = require('fs');
const sessionStore = require('../sessionStore');
const cookie = require('cookie');
const signature = require('cookie-signature');

// 서버에서 사용한 세션 스토어를 불러옵니다 (server.js에서 app.use(session({ store }))에 사용한 store 인스턴스)
// MemoryStore 예시 (실제 서비스에서는 RedisStore 등으로 교체)

// HTTP 요청용 토큰 인증
const authenticateToken = async (req, res, next) => {
  try {
    // 세션에서 사용자 정보 확인
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }

    // 토큰 확인
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ error: 'Invalid token' });
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
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// WebSocket 인증
const authenticateWebSocket = async (ws, req) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    let rawSid = cookies['connect.sid'];

    // 1. 회원/관리자: connect.sid로 인증
    if (rawSid) {
      if (rawSid.startsWith('s:')) {
        rawSid = rawSid.slice(2);
        rawSid = signature.unsign(rawSid, process.env.SESSION_SECRET || "default_secret_key");
      }
      if (!rawSid) {
        console.log('Session ID signature invalid');
        return false;
      }
      return new Promise((resolve) => {
        sessionStore.get(rawSid, (err, session) => {
          if (err || !session) {
            console.log('Session not found:', rawSid);
            resolve(false);
          } else {
            req.session = session;
            req.user = session.user || session.guest || null;
            resolve(true);
          }
        });
      });
    }

    // 2. 관리자: JWT 토큰으로 인증 (쿠키 또는 Authorization 헤더)
    let token = null;
    if (cookies['admin_token']) {
      token = cookies['admin_token'];
    } else if (req.headers['authorization']) {
      const authHeader = req.headers['authorization'];
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.isAdmin) {
          req.user = decoded;
          return true;
        }
      } catch (e) {
        console.log('Admin JWT invalid:', e.message);
      }
    }

    // 3. 게스트: guestId 쿠키로 인증
    const guestId = cookies['guestId'];
    if (guestId) {
      req.user = { isGuest: true, guestId };
      return true;
    }

    // 둘 다 없으면 인증 실패
    console.log('No connect.sid, admin_token, or guestId cookie found');
    return false;
  } catch (e) {
    console.error('WebSocket session parse error:', e);
    return false;
  }
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