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
  const isAuthenticated = await authenticateWebSocket(ws, req);
  if (!isAuthenticated) {
    ws.close();
    return;
  }

  const { userId, isAdmin, isGuest, guestId } = req.user;
  if (isAdmin) {
    adminClients.set(userId, ws);
  } else if (isGuest) {
    guestClients.set(guestId, ws);
  } else {
    clients.set(userId, ws);
  }

  ws.on('message', async raw => {
    const data = JSON.parse(raw);
    switch (data.type) {
      case 'chat':
        await handleChatMessage(data, req.user);
        break;
      case 'typing':
        handleTypingStatus(data, req.user);
        break;
    }
  });

  ws.on('close', () => {
    if (isAdmin) adminClients.delete(userId);
    else if (isGuest) guestClients.delete(guestId);
    else clients.delete(userId);
  });
});

async function handleChatMessage(data, user) {
  console.log('서버에서 메시지 수신:', { data, user });
  const { roomId, message } = data;
  const { userId, isAdmin, isGuest, guestId } = user;
  const senderType = isAdmin ? 'admin' : isGuest ? 'guest' : 'user';
  const senderId = isGuest ? guestId : userId;

  try {
    // 1) 메시지 DB 저장
    console.log('DB에 메시지 저장 시도:', { roomId, senderType, senderId, message });
    const [insertResult] = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_type, sender_id, message)
       VALUES (?, ?, ?, ?)`,
      [roomId, senderType, senderId, message]
    );
    console.log('DB 저장 성공:', insertResult);

    // 2) 방 정보 조회
    const [rooms] = await pool.query(
      `SELECT user_id, admin_id, guest_id
       FROM chat_rooms
       WHERE id = ?`,
      [roomId]
    );
    const room = rooms[0];
    console.log('채팅방 정보:', room);

    // 3) 대상 WebSocket 찾기
    let targetWs;
    if (isAdmin) {
      targetWs = room.guest_id
        ? guestClients.get(room.guest_id)
        : clients.get(room.user_id);
    } else {
      targetWs = adminClients.get(room.admin_id);
    }
    console.log('대상 WebSocket 찾음:', !!targetWs);

    // 4) 전송
    if (targetWs && targetWs.readyState === WebSocket.OPEN) {
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
      console.log('메시지 전송:', responseData);
      targetWs.send(JSON.stringify(responseData));
    } else {
      console.log('대상 WebSocket이 연결되지 않음');
    }

  } catch (err) {
    console.error('Chat message error:', err);
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

// ── 채팅 로그 조회 ──
router.get('/admin/chat-logs', authenticateToken, async (req, res) => {
  const { roomId, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  try {
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

// 비회원 채팅방 생성
router.post('/guest/rooms', async (req, res) => {
  const { name, email } = req.body;
  const guestId = generateGuestId();
  
  try {
    // 비회원 정보 저장
    const [guestResult] = await pool.query(
      'INSERT INTO chat_guests (id, name, email) VALUES (?, ?, ?)',
      [guestId, name, email]
    );

    // 채팅방 생성
    const [roomResult] = await pool.query(
      'INSERT INTO chat_rooms (guest_id, status) VALUES (?, ?)',
      [guestId, 'active']
    );

    // 쿠키에 guestId 저장
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

module.exports = { loginRouter, router, wss };
