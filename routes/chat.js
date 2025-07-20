// 📁 routes/chat.js
const express = require('express');
const loginRouter = express.Router();
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const pool = require('../db'); // assume mysql2/promise 연결 객체
const { authenticateToken, isChatAdmin, authenticateWebSocket } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// WebSocket 서버 설정
const wss = new WebSocket.Server({ noServer: true });

// WebSocket 연결 관리
const clients = new Map();    // userId -> ws
const adminClients = new Map(); // adminId -> ws
const guestClients = new Map(); // guestId -> ws

function generateGuestId() {
  return `guest_${uuidv4()}`;
}

wss.on('connection', async (ws, req) => {
  console.log('[WebSocket] 새로운 연결 시도:', {
    ip: req.socket?.remoteAddress,
    user: req.user
  });

  const isAuthenticated = await authenticateWebSocket(ws, req);
  if (!isAuthenticated) {
    console.log('[WebSocket] 인증 실패, 연결 종료');
    ws.close();
    return;
  }

  const { id, isAdmin, isGuest, guestId } = req.user;
  const userId = id;

  console.log('[WebSocket] 인증 성공:', { userId, isAdmin, isGuest, guestId });

  // 클라이언트 연결 관리
  if (isAdmin) {
    adminClients.set(userId, ws);
    console.log('[WebSocket] 관리자 클라이언트 등록:', userId);
  } else if (isGuest) {
    guestClients.set(guestId, ws);
    console.log('[WebSocket] 게스트 클라이언트 등록:', guestId);
  } else {
    clients.set(userId, ws);
    console.log('[WebSocket] 유저 클라이언트 등록:', userId);
  }

  ws.on('message', async raw => {
    try {
      const data = JSON.parse(raw);
      console.log('[WebSocket] 메시지 수신:', data);

      switch (data.type) {
        case 'init':
          console.log('[WebSocket] 클라이언트 초기화:', data);
          ws.send(JSON.stringify({
            type: 'init',
            status: 'success',
            userId: req.user?.id,
            isGuest: req.user?.isGuest
          }));
          break;
        case 'chat':
          console.log('[WebSocket] 채팅 메시지 처리:', data);
          await handleChatMessage(data, req.user);
          break;
        case 'typing':
          console.log('[WebSocket] 타이핑 상태 처리:', data);
          handleTypingStatus(data, req.user);
          break;
        default:
          console.log('[WebSocket] 알 수 없는 메시지 타입:', data.type);
      }
    } catch (error) {
      console.error('[WebSocket] 메시지 처리 오류:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }));
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] 연결 종료:', { userId, isAdmin, isGuest, guestId });
    if (isAdmin) {
      adminClients.delete(userId);
    } else if (isGuest) {
      guestClients.delete(guestId);
    } else {
      clients.delete(userId);
    }
  });

  ws.on('error', (error) => {
    console.error('[WebSocket] 연결 오류:', error);
  });
});

async function handleChatMessage(data, user) {
  const { roomId, message } = data;
  const { id, isAdmin, isGuest, guestId } = user;
  const userId = id;
  const senderType = isAdmin ? 'admin' : isGuest ? 'guest' : 'user';
  const senderId = isGuest ? guestId : userId;

  console.log('[handleChatMessage] 메시지 처리 시작:', { roomId, message, senderType, senderId, user });

  if (!senderId) {
    console.error('Invalid senderId, 메시지 저장을 건너뜁니다:', { senderType, senderId, data, user });
    return;
  }

  try {
    // 1) 메시지 DB 저장
    const [insertResult] = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_type, sender_id, message)
         VALUES (?, ?, ?, ?)`,
      [roomId, senderType, senderId, message]
    );
    console.log('[handleChatMessage] DB 저장 성공:', insertResult);

    // 2) 방 정보 조회
    const [rooms] = await pool.query(
      `SELECT user_id, admin_id, guest_id
       FROM chat_rooms
       WHERE id = ?`,
      [roomId]
    );
    const room = rooms[0];
    console.log('[handleChatMessage] 채팅방 정보:', room);

    // 3) 메시지 응답 데이터 생성
    const responseData = {
      type: 'chat',
      roomId,
      message: {
        id: insertResult.insertId,
        room_id: roomId,
        sender_type: senderType,
        sender_id: senderId,
        message,
        created_at: new Date()
      },
      sender: senderType
    };

    console.log('[handleChatMessage] 전송할 메시지:', responseData);

    // 4) 대상 WebSocket 찾기 및 전송
    let targetWs = null;

    if (isAdmin) {
      // 관리자가 보낸 메시지 -> 유저/게스트에게 전송
      if (room.guest_id) {
        targetWs = guestClients.get(room.guest_id);
        console.log('[handleChatMessage] 게스트 클라이언트 찾기:', room.guest_id, !!targetWs);
      } else if (room.user_id) {
        targetWs = clients.get(room.user_id);
        console.log('[handleChatMessage] 유저 클라이언트 찾기:', room.user_id, !!targetWs);
      }
    } else {
      // 유저/게스트가 보낸 메시지 -> 관리자에게 전송
      if (room.admin_id) {
        targetWs = adminClients.get(room.admin_id);
        console.log('[handleChatMessage] 관리자 클라이언트 찾기:', room.admin_id, !!targetWs);
      }
    }

    // 5) 메시지 전송
    if (targetWs && targetWs.readyState === WebSocket.OPEN) {
      console.log('[handleChatMessage] 메시지 전송 성공');
      targetWs.send(JSON.stringify(responseData));
    } else {
      console.log('[handleChatMessage] 대상 WebSocket이 연결되지 않음:', {
        targetWs: !!targetWs,
        readyState: targetWs?.readyState,
        isAdmin,
        room
      });
    }

    // 6) 채팅방 마지막 메시지 시간 업데이트
    await pool.query(
      'UPDATE chat_rooms SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
      [roomId]
    );

  } catch (err) {
    console.error('[handleChatMessage] Chat message error:', err);
  }
}

function handleTypingStatus(data, user) {
  const { roomId, isTyping } = data;
  const { userId, isAdmin, isGuest, guestId } = user;

  let targetWs;
  if (isAdmin) {
    targetWs = data.guestId
      ? guestClients.get(data.guestId)
      : clients.get(data.userId);
  } else {
    targetWs = adminClients.get(data.adminId);
  }

  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    targetWs.send(JSON.stringify({
      type: 'typing',
      roomId,
      isTyping,
      userId: isAdmin ? null : isGuest ? guestId : userId,
      adminId: isAdmin ? userId : null,
      guestId: isGuest ? guestId : null
    }));
  }
}

// ── 로그인 ──
loginRouter.post('/', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM chat_admins WHERE email = ?', [email]
    );
    const admin = rows[0];
    if (!admin || admin.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.query(
      'UPDATE chat_admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [admin.id]
    );

    const token = jwt.sign(
      { id: admin.id, email: admin.email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── 관리자 로그아웃 ──
router.post('/admin/logout', authenticateToken, async (req, res) => {
  const ws = adminClients.get(req.user.id);
  if (ws) ws.close();
  res.json({ message: 'Logged out successfully' });
});

// ── 기본 메시지 CRUD ──
// 생성
router.post('/admin/default-messages', authenticateToken, async (req, res) => {
  const { message, category } = req.body;
  try {
    const [insertResult] = await pool.query(
      'INSERT INTO default_messages (message, category, created_by) VALUES (?, ?, ?)',
      [message, category, req.user.id]
    );
    res.json({ id: insertResult.insertId, message, category });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 조회
router.get('/admin/default-messages', authenticateToken, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM default_messages ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 수정
router.put('/admin/default-messages/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { message, category } = req.body;
  try {
    await pool.query(
      'UPDATE default_messages SET message = ?, category = ? WHERE id = ?',
      [message, category, id]
    );
    res.json({ id, message, category });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 삭제
router.delete('/admin/default-messages/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM default_messages WHERE id = ?', [id]);
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 관리자용 기본 메시지 조회
router.get('/admin/default-message', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM chat_default_message LIMIT 1');
    res.json(rows[0] || { message: '' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── 채팅 로그 조회 ──
router.get('/admin/chat-logs', authenticateToken, async (req, res) => {
  const { roomId, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  try {
    // 채팅방 존재 여부만 확인
    const [rooms] = await pool.query('SELECT * FROM chat_rooms WHERE id = ?', [roomId]);
    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Chat room not found' });
    }
    const [rows] = await pool.query(
      `SELECT m.*, 
        CASE
          WHEN m.sender_type='user' THEN u.name
          WHEN m.sender_type='guest' THEN g.name
          WHEN m.sender_type='admin' THEN a.name
        END AS sender_name
       FROM chat_messages m
       LEFT JOIN users u ON m.sender_type='user' AND m.sender_id=u.id
       LEFT JOIN chat_guests g ON m.sender_type='guest' AND m.sender_id=g.id
       LEFT JOIN chat_admins a ON m.sender_type='admin' AND m.sender_id=a.id
       WHERE m.room_id=?
       ORDER BY m.created_at ASC
       LIMIT ? OFFSET ?`,
      [roomId, Number(limit), Number(offset)]
    );
    res.json(rows);
  } catch (err) {
    console.error('Admin chat logs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 채팅방 목록 조회 (관리자용) - 비회원 채팅방 포함
router.get('/admin/rooms', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, 
        COALESCE(u.name, g.name) as sender_name,
        COALESCE(u.email, g.email) as sender_email,
        CASE 
          WHEN r.user_id IS NOT NULL THEN 'user'
          WHEN r.guest_id IS NOT NULL THEN 'guest'
        END as sender_type,
        (SELECT COUNT(*) FROM chat_messages m 
         WHERE m.room_id = r.id 
         AND m.is_read = false 
         AND m.sender_type IN ('user', 'guest')) as unread_count
      FROM chat_rooms r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN chat_guests g ON r.guest_id = g.id
      WHERE r.admin_id = ? OR r.admin_id IS NULL
      ORDER BY r.last_message_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 채팅방 생성
router.post('/rooms', authenticateToken, async (req, res) => {
  const { userId } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO chat_rooms (user_id, admin_id) VALUES (?, ?)',
      [userId, req.user.id]
    );
    // 기본 메시지 가져오기
    const [[defaultMsg]] = await pool.query('SELECT * FROM chat_default_message LIMIT 1');
    if (defaultMsg && defaultMsg.message) {
      await pool.query(
        'INSERT INTO chat_messages (room_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)',
        [result.insertId, 'admin', req.user.id, defaultMsg.message]
      );
    }
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 채팅방 종료
router.post('/admin/rooms/:roomId/close', authenticateToken, async (req, res) => {
  const { roomId } = req.params;
  try {
    await pool.query(
      'UPDATE chat_rooms SET status = ? WHERE id = ?',
      ['closed', roomId]
    );
    res.json({ message: 'Chat room closed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── 비회원 채팅방 생성 ──
router.post('/guest/rooms', async (req, res) => {
  const { name, email } = req.body;
  try {
    // 1. 기존 guestId 있는지 확인
    const [guests] = await pool.query(
      'SELECT id FROM chat_guests WHERE name = ? AND email = ?',
      [name, email]
    );
    let guestId;
    if (guests.length > 0) {
      guestId = guests[0].id;
      // 2. 기존 채팅방 있는지 확인
      const [rooms] = await pool.query(
        'SELECT * FROM chat_rooms WHERE guest_id = ? ORDER BY created_at DESC LIMIT 1',
        [guestId]
      );
      if (rooms.length > 0) {
        res.cookie('guestId', guestId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
        });
        return res.json({
          room: { id: rooms[0].id },
          guest: { id: guestId, name, email }
        });
      }
    } else {
      // 3. 없으면 새로 생성
      guestId = generateGuestId();
      await pool.query(
        'INSERT INTO chat_guests (id, name, email) VALUES (?, ?, ?)',
        [guestId, name, email]
      );
    }
    // 4. 새 방 생성
    const [roomResult] = await pool.query(
      'INSERT INTO chat_rooms (guest_id, status) VALUES (?, ?)',
      [guestId, 'active']
    );
    // 기본 메시지
    const [[defaultMsg]] = await pool.query('SELECT * FROM chat_default_message LIMIT 1');
    if (defaultMsg && defaultMsg.message) {
      await pool.query(
        'INSERT INTO chat_messages (room_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)',
        [roomResult.insertId, 'admin', 1, defaultMsg.message]
      );
    }
    res.cookie('guestId', guestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
    });
    res.json({
      room: { id: roomResult.insertId },
      guest: { id: guestId, name, email }
    });
  } catch (error) {
    console.error('Guest room creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 비회원 채팅방 조회
router.get('/guest/rooms/:guestId', async (req, res) => {
  const { guestId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT r.*, g.name as guest_name, g.email as guest_email
       FROM chat_rooms r
       JOIN chat_guests g ON r.guest_id = g.id
       WHERE r.guest_id = ?
       ORDER BY r.last_message_at DESC`,
      [guestId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 유저용 채팅 로그 조회
router.get('/user/chat-logs', authenticateToken, async (req, res) => {
  const { roomId, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  try {
    // 채팅방이 본인 소유인지 확인
    const [rooms] = await pool.query('SELECT * FROM chat_rooms WHERE id = ? AND user_id = ?', [roomId, req.user.id]);
    if (rooms.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const [rows] = await pool.query(
      `SELECT m.*,
        CASE
          WHEN m.sender_type='user' THEN u.name
          WHEN m.sender_type='admin' THEN a.name
        END AS sender_name
       FROM chat_messages m
       LEFT JOIN users u ON m.sender_type='user' AND m.sender_id=u.id
       LEFT JOIN chat_admins a ON m.sender_type='admin' AND m.sender_id=a.id
       WHERE m.room_id=?
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [roomId, Number(limit), Number(offset)]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 게스트용 채팅 로그 조회
router.get('/guest/chat-logs', async (req, res) => {
  const { roomId, guestId, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  try {
    // 채팅방이 해당 guest의 것인지 확인
    const [rooms] = await pool.query('SELECT * FROM chat_rooms WHERE id = ? AND guest_id = ?', [roomId, guestId]);
    if (rooms.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const [rows] = await pool.query(
      `SELECT m.*,
        CASE
          WHEN m.sender_type='guest' THEN g.name
          WHEN m.sender_type='admin' THEN a.name
        END AS sender_name
       FROM chat_messages m
       LEFT JOIN chat_guests g ON m.sender_type='guest' AND m.sender_id=g.id
       LEFT JOIN chat_admins a ON m.sender_type='admin' AND m.sender_id=a.id
       WHERE m.room_id=?
       ORDER BY m.created_at ASC
       LIMIT ? OFFSET ?`,
      [roomId, Number(limit), Number(offset)]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1. 일주일 이상된 채팅방/메시지 로그파일 저장 및 삭제 스케쥴러
cron.schedule('0 3 * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    // 1) 오래된 채팅방 조회
    const [oldRooms] = await pool.query(
      `SELECT * FROM chat_rooms WHERE last_message_at < ?`, [cutoff]
    );
    if (oldRooms.length === 0) return;
    const roomIds = oldRooms.map(r => r.id);
    // 2) 해당 방의 메시지 조회
    const [oldMessages] = await pool.query(
      `SELECT * FROM chat_messages WHERE room_id IN (?)`, [roomIds]
    );
    // 3) 로그 파일로 저장
    const logDir = path.join(__dirname, '../chat_logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    const logFile = path.join(logDir, `chatlog_${cutoff.toISOString().slice(0, 10)}.json`);
    fs.writeFileSync(logFile, JSON.stringify({ rooms: oldRooms, messages: oldMessages }, null, 2));
    // 4) 메시지/방 삭제
    await pool.query(`DELETE FROM chat_messages WHERE room_id IN (?)`, [roomIds]);
    await pool.query(`DELETE FROM chat_rooms WHERE id IN (?)`, [roomIds]);
    console.log(`[CRON] ${oldRooms.length}개 채팅방/메시지 백업 및 삭제 완료`);
  } catch (err) {
    console.error('[CRON] 채팅 로그 백업/삭제 실패:', err);
  }
});

// 2. 관리자용 채팅방 검색/필터 API
// GET /api/chat/admin/rooms/search?name=...&email=...&type=...
router.get('/admin/rooms/search', authenticateToken, async (req, res) => {
  try {
    const { name, email, type } = req.query;
    let where = [];
    let params = [];
    if (name) {
      where.push('(COALESCE(u.name, g.name) LIKE ?)');
      params.push(`%${name}%`);
    }
    if (email) {
      where.push('(COALESCE(u.email, g.email) LIKE ?)');
      params.push(`%${email}%`);
    }
    if (type === 'user') {
      where.push('r.user_id IS NOT NULL');
    } else if (type === 'guest') {
      where.push('r.guest_id IS NOT NULL');
    }
    let whereSql = where.length ? 'AND ' + where.join(' AND ') : '';
    const [rows] = await pool.query(
      `SELECT r.*, 
        COALESCE(u.name, g.name) as sender_name,
        COALESCE(u.email, g.email) as sender_email,
        CASE 
          WHEN r.user_id IS NOT NULL THEN 'user'
          WHEN r.guest_id IS NOT NULL THEN 'guest'
        END as sender_type,
        (SELECT COUNT(*) FROM chat_messages m 
         WHERE m.room_id = r.id 
         AND m.is_read = false 
         AND m.sender_type IN ('user', 'guest')) as unread_count
      FROM chat_rooms r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN chat_guests g ON r.guest_id = g.id
      WHERE (r.admin_id = ? OR r.admin_id IS NULL) ${whereSql}
      ORDER BY r.last_message_at DESC`,
      [req.user.id, ...params]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 로그 파일 목록 조회 API
router.get('/admin/logs', authenticateToken, async (req, res) => {
  try {
    const logDir = path.join(__dirname, '../chat_logs');
    if (!fs.existsSync(logDir)) {
      return res.json({ files: [] });
    }
    const files = fs.readdirSync(logDir)
      .filter(file => file.startsWith('chatlog_') && file.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a)); // 최신 파일이 먼저 오도록 정렬
    res.json({ files });
  } catch (err) {
    console.error('로그 파일 목록 조회 실패:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 로그 파일 다운로드 API
router.get('/admin/logs/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const logDir = path.join(__dirname, '../chat_logs');
    const filePath = path.join(logDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Log file not found' });
    }

    res.download(filePath);
  } catch (err) {
    console.error('로그 파일 다운로드 실패:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 유저/게스트용 기본 메시지 조회 (인증 없음)
router.get('/default-message', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM chat_default_message LIMIT 1');
    res.json(rows[0] || { message: '' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/admin/send', authenticateToken, async (req, res) => {
  const { roomId, message } = req.body;
  if (!roomId || !message) return res.status(400).json({ error: 'roomId, message required' });

  try {
    console.log('[admin/send] 관리자 메시지 전송:', { roomId, message, adminId: req.user.id });

    // 1) 관리자 메시지 저장
    const [insertResult] = await pool.query(
      'INSERT INTO chat_messages (room_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)',
      [roomId, 'admin', req.user.id, message]
    );

    // 2) 방 정보 조회
    const [rooms] = await pool.query(
      'SELECT user_id, admin_id, guest_id FROM chat_rooms WHERE id = ?',
      [roomId]
    );
    const room = rooms[0];

    // 3) 메시지 응답 데이터 생성
    const responseData = {
      type: 'chat',
      roomId,
      message: {
        id: insertResult.insertId,
        room_id: roomId,
        sender_type: 'admin',
        sender_id: req.user.id,
        message,
        created_at: new Date()
      },
      sender: 'admin'
    };

    console.log('[admin/send] 전송할 메시지:', responseData);

    // 4) 클라이언트에게 실시간 전송
    let targetWs = null;
    if (room.guest_id) {
      targetWs = guestClients.get(room.guest_id);
      console.log('[admin/send] 게스트 클라이언트 찾기:', room.guest_id, !!targetWs);
    } else if (room.user_id) {
      targetWs = clients.get(room.user_id);
      console.log('[admin/send] 유저 클라이언트 찾기:', room.user_id, !!targetWs);
    }

    if (targetWs && targetWs.readyState === WebSocket.OPEN) {
      console.log('[admin/send] 메시지 전송 성공');
      targetWs.send(JSON.stringify(responseData));
    } else {
      console.log('[admin/send] 대상 WebSocket이 연결되지 않음');
    }

    // 5) 채팅방 마지막 메시지 시간 업데이트
    await pool.query(
      'UPDATE chat_rooms SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
      [roomId]
    );

    res.json({ success: true, messageId: insertResult.insertId });
  } catch (err) {
    console.error('[admin/send] 오류:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 메시지 읽음 처리
router.post('/user/chat-logs/read', async (req, res) => {
  const { roomId } = req.body;
  console.log('읽음 처리 요청:', roomId);
  if (!roomId) return res.status(400).json({ error: 'roomId required' });
  try {
    const [result] = await pool.query(
      "UPDATE chat_messages SET is_read = 1 WHERE room_id = ? AND sender_type = 'admin' AND is_read = 0",
      [roomId]
    );
    console.log('UPDATE 결과:', result);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    console.error('읽음 처리 에러:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 게스트용 읽음 처리
router.post('/guest/chat-logs/read', async (req, res) => {
  const { roomId, guestId } = req.body;
  if (!roomId || !guestId) return res.status(400).json({ error: 'roomId, guestId required' });
  try {
    // guestId가 맞는지 확인
    const [rooms] = await pool.query('SELECT * FROM chat_rooms WHERE id = ? AND guest_id = ?', [roomId, guestId]);
    if (rooms.length === 0) return res.status(403).json({ error: 'Access denied' });
    await pool.query(
      "UPDATE chat_messages SET is_read = 1 WHERE room_id = ? AND sender_type = 'admin' AND is_read = 0",
      [roomId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 관리자: userId 또는 guestId로 채팅방 조회
router.get('/admin/room-by-user-or-guest', authenticateToken, async (req, res) => {
  const { userId, guestId } = req.query;
  if (!userId && !guestId) {
    return res.status(400).json({ error: 'userId 또는 guestId가 필요합니다.' });
  }
  try {
    let query, params;
    if (userId) {
      query = 'SELECT * FROM chat_rooms WHERE user_id = ? ORDER BY created_at DESC LIMIT 1';
      params = [userId];
    } else {
      query = 'SELECT * FROM chat_rooms WHERE guest_id = ? ORDER BY created_at DESC LIMIT 1';
      params = [guestId];
    }
    const [rooms] = await pool.query(query, params);
    if (rooms.length === 0) {
      return res.status(404).json({ error: '채팅방을 찾을 수 없습니다.' });
    }
    res.json(rooms[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
// 관리자용 기본 메시지 수정
router.put('/admin/default-message', authenticateToken, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  try {
    // chat_default_message 테이블에 row가 없으면 새로 생성, 있으면 수정
    const [rows] = await pool.query('SELECT * FROM chat_default_message LIMIT 1');
    if (rows.length === 0) {
      await pool.query('INSERT INTO chat_default_message (message) VALUES (?)', [message]);
    } else {
      await pool.query('UPDATE chat_default_message SET message = ? WHERE id = ?', [message, rows[0].id]);
    }
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 관리자용 읽음 처리
router.post('/admin/chat-logs/read', authenticateToken, async (req, res) => {
  const { roomId } = req.body;
  if (!roomId) return res.status(400).json({ error: 'roomId required' });
  try {
    const [result] = await pool.query(
      "UPDATE chat_messages SET is_read = 1 WHERE room_id = ? AND sender_type IN ('user', 'guest') AND is_read = 0",
      [roomId]
    );
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/admin/rooms/unread-counts', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT room_id, COUNT(*) as unreadCount
       FROM chat_messages
       WHERE is_read = 0 AND sender_type IN ('user', 'guest')
       GROUP BY room_id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = { loginRouter, router, wss };
