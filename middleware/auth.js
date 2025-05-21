const jwt = require('jsonwebtoken');
const pool = require('../db');

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

// WebSocket 인증 미들웨어
const authenticateWebSocket = async (ws, req) => {
  try {
    const token = req.headers['sec-websocket-protocol']?.split(', ')[1];
    
    if (!token) {
      // 비회원 WebSocket 연결 처리
      const guestId = req.headers.cookie?.split('; ')
        .find(row => row.startsWith('guestId='))
        ?.split('=')[1];

      if (guestId) {
        const result = await pool.query(
          'SELECT * FROM chat_guests WHERE id = $1',
          [guestId]
        );
        
        if (result.rows.length > 0) {
          req.user = {
            isGuest: true,
            guestId: guestId
          };
          return true;
        }
      }
      return false;
    }

    // 회원/관리자 WebSocket 연결 처리
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return true;
  } catch (error) {
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