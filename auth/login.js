/*

// ✅ 로그인 라우트 (auth/login.js)
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db"); // 📌 DB 연결은 별도 모듈화

// ✅ 로그인 API
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "login.email_error" });
  }
  if (!password) {
    return res.status(400).json({ error: "login.password_error" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "login.fail" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "login.fail" });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin || false,
    };

    return res.json({ message: "login.success", user: req.session.user });
  } catch (err) {
    console.error("로그인 에러:", err);
    return res.status(500).json({ error: "login.fail" });
  }
});

// ✅ 관리자 로그인 API
router.post("/admin-login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM admins WHERE username = ?", [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.user = {
      id: admin.id,
      name: admin.name,
      isAdmin: true,
    };

    return res.json({ message: "Admin login success", user: req.session.user });
  } catch (err) {
    console.error("Admin 로그인 에러:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

// ✅ 세션 확인 API
router.get("/me", (req, res) => {
  if (req.session.user) {
    return res.json({ user: req.session.user });
  } else {
    return res.status(401).json({ error: "Not authenticated" });
  }
});

// ✅ 일반 로그아웃 API
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    return res.json({ message: "Logout successful" });
  });
});

// ✅ 관리자 로그아웃 API
router.post("/admin-logout", (req, res) => {
  if (!req.session.user?.isAdmin) return res.status(403).json({ error: "Unauthorized" });

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    return res.json({ message: "Admin logout successful" });
  });
});

// ✅ 사용자 메시지 저장
router.post("/message", async (req, res) => {
  const { message } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  try {
    await db.query(
      "INSERT INTO chat_messages (user_id, sender, message) VALUES (?, 'user', ?)",
      [user.id, message]
    );
    res.json({ message: "Message stored" });
  } catch (err) {
    console.error("❌ 메시지 저장 오류:", err);
    res.status(500).json({ error: "Message save error" });
  }
});

// ✅ 관리자 응답 저장
router.post("/reply", async (req, res) => {
  const { userId, message } = req.body;
  if (!req.session.user?.isAdmin) return res.status(403).json({ error: "Unauthorized" });

  try {
    await db.query(
      "INSERT INTO chat_messages (user_id, sender, message) VALUES (?, 'admin', ?)",
      [userId, message]
    );
    res.json({ message: "Reply stored" });
  } catch (err) {
    console.error("❌ 관리자 응답 저장 오류:", err);
    res.status(500).json({ error: "Reply save error" });
  }
});

// ✅ 관리자 채팅 이력 조회
router.get("/messages/:userId", async (req, res) => {
  if (!req.session.user?.isAdmin) return res.status(403).json({ error: "Unauthorized" });

  const { userId } = req.params;
  try {
    const [messages] = await db.query(
      `SELECT m.id, m.message, m.sender, m.created_at, u.name AS user_name, u.email AS user_email
       FROM chat_messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.user_id = ?
       ORDER BY m.created_at ASC`,
      [userId]
    );
    res.json(messages);
  } catch (err) {
    console.error("❌ 채팅 이력 조회 실패:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ 전체 사용자 목록 (관리자용)
router.get("/users", async (req, res) => {
  if (!req.session.user?.isAdmin) return res.status(403).json({ error: "Unauthorized" });
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT u.id, u.name, u.email
       FROM users u
       JOIN chat_messages m ON u.id = m.user_id
       ORDER BY MAX(m.created_at) DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ 사용자 목록 조회 실패:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
*/

// ✅ 로그인 라우트 (auth/login.js)
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const { sendResetCode } = require('../utils/sendMail');
const db = require("../db"); // 📌 DB 연결은 별도 모듈화

// ✅ 로그인 API
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}
function isValidPhone(val) {
  return /^\+\d{1,3}\s?\d{4,14}$/.test(val);
}
// ▶ 로그인
// POST /api/auth/login
// body: { identifier, password, captchaToken }
router.post("/login", async (req, res) => {
  const { identifier, password, captchaToken } = req.body;

  // 1) 입력 검증
  if (!identifier || !(isValidEmail(identifier) || isValidPhone(identifier))) {
    return res.status(400).json({ error: "login.identifier_error" });
  }
  if (!password) {
    return res.status(400).json({ error: "login.password_error" });
  }
  if (!captchaToken) {
    return res.status(400).json({ error: "login.captcha_required" });
  }

  // 2) reCAPTCHA 검증
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const resp = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captchaToken}`,
      { method: "POST" }
    );
    const data = await resp.json();
    if (!data.success) {
      return res.status(403).json({ error: "login.captcha_failed" });
    }
  } catch (e) {
    console.error("CAPTCHA 검증 오류:", e);
    return res.status(500).json({ error: "login.captcha_error" });
  }

  // 3) 사용자 조회 (이메일 또는 전화번호)
  try {
    const [rows] = await db.query(
      `SELECT * 
       FROM users 
       WHERE (email = ? OR phone = ?) 
         AND is_active = 1 
         AND is_blocked = 0`,
      [identifier, identifier]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "login.fail" });
    }
    const user = rows[0];

    // 4) 비밀번호 비교
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "login.fail" });
    }

    // 5) 세션 설정
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      nationality: user.nationality,
      isAdmin: false  // 여기서는 항상 일반 사용자
    };

    // 세션 저장 후 응답
    req.session.save((err) => {
      if (err) {
        console.error("세션 저장 에러:", err);
        return res.status(500).json({ error: "login.fail" });
      }
      return res.json({
        message: "login.success",
        user: req.session.user
      });
    });
  } catch (err) {
    console.error("로그인 에러:", err);
    return res.status(500).json({ error: "login.fail" });
  }
});

// ✅ 관리자 로그인 API
router.post("/admin-login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM admins WHERE username = ?", [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.user = {
      id: admin.id,
      name: admin.name,
      isAdmin: true,
    };

    return res.json({ message: "Admin login success", user: req.session.user });
  } catch (err) {
    console.error("Admin 로그인 에러:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

// ✅ 관리자 세션 확인 API
router.get("/admin/me", (req, res) => {
  if (req.session.user?.isAdmin) {
    return res.json({ user: req.session.user });
  } else {
    return res.status(401).json({ error: "Not authenticated as admin" });
  }
});

// ✅ 일반 로그아웃 API
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    return res.json({ message: "Logout successful" });
  });
});

// ✅ 관리자 로그아웃 API
router.post("/admin-logout", (req, res) => {
  if (!req.session.user?.isAdmin) return res.status(403).json({ error: "Unauthorized" });

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    return res.json({ message: "Admin logout successful" });
  });
});

// ✅ 사용자 메시지 저장
router.post("/message", async (req, res) => {
  const { message } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  try {
    await db.query(
      "INSERT INTO chat_messages (user_id, sender, message) VALUES (?, 'user', ?)",
      [user.id, message]
    );
    res.json({ message: "Message stored" });
  } catch (err) {
    console.error("❌ 메시지 저장 오류:", err);
    res.status(500).json({ error: "Message save error" });
  }
});

// ✅ 관리자 응답 저장
router.post("/reply", async (req, res) => {
  const { userId, message } = req.body;
  if (!req.session.user?.isAdmin) return res.status(403).json({ error: "Unauthorized" });

  try {
    await db.query(
      "INSERT INTO chat_messages (user_id, sender, message) VALUES (?, 'admin', ?)",
      [userId, message]
    );
    res.json({ message: "Reply stored" });
  } catch (err) {
    console.error("❌ 관리자 응답 저장 오류:", err);
    res.status(500).json({ error: "Reply save error" });
  }
});

// ✅ 관리자 채팅 이력 조회
router.get("/messages/:userId", async (req, res) => {
  if (!req.session.user?.isAdmin) return res.status(403).json({ error: "Unauthorized" });

  const { userId } = req.params;
  try {
    const [messages] = await db.query(
      `SELECT m.id, m.message, m.sender, m.created_at, u.name AS user_name, u.email AS user_email
       FROM chat_messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.user_id = ?
       ORDER BY m.created_at ASC`,
      [userId]
    );
    res.json(messages);
  } catch (err) {
    console.error("❌ 채팅 이력 조회 실패:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ 전체 사용자 목록 (관리자용)
router.get("/users", async (req, res) => {
  if (!req.session.user?.isAdmin) return res.status(403).json({ error: "Unauthorized" });
  try {
    const [rows] = await db.query(
      `SELECT 
  u.id, 
  u.name, 
  u.email, 
  MAX(m.created_at) AS last_message,
  SUM(CASE WHEN m.sender = 'user' AND m.is_read = FALSE THEN 1 ELSE 0 END) AS unread_count
FROM users u
JOIN chat_messages m ON u.id = m.user_id
GROUP BY u.id, u.name, u.email
ORDER BY last_message DESC;

`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ 사용자 목록 조회 실패:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
// ✅ 세션 확인 API
router.get("/me", async (req, res) => {
  if (req.session.user) {
    let user = req.session.user;
    // roomId가 없으면 자동 생성
    if (!user.roomId) {
      try {
        const db = require('../db');
        // 1. 기존에 방이 있는지 확인
        const [rooms] = await db.query('SELECT id FROM chat_rooms WHERE user_id = ? LIMIT 1', [user.id]);
        let roomId;
        if (rooms.length > 0) {
          roomId = rooms[0].id;
        } else {
          // 2. 없으면 새로 생성
          const [result] = await db.query('INSERT INTO chat_rooms (user_id, status, created_at) VALUES (?, ?, NOW())', [user.id, 'active']);
          roomId = result.insertId;
        }
        user = { ...user, roomId };
        req.session.user = user;
        return res.json({ user });
      } catch (err) {
        console.error('채팅방 자동 생성 오류:', err);
        return res.status(500).json({ error: 'Failed to create chat room' });
      }
    } else {
      return res.json({ user });
    }
  } else {
    return res.status(401).json({ error: "Not authenticated" });
  }
});

// ✅ 메시지 읽음 처리
// ✅ 메시지 읽음 처리
router.patch("/messages/:userId/read", async (req, res) => {
  const sessionUser = req.session.user;
  const { userId } = req.params;

  if (!sessionUser) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const isAdmin = sessionUser.isAdmin === true;
  const isSelf = String(sessionUser.id) === String(userId);

  // 관리자 또는 본인만 가능
  if (!isAdmin && !isSelf) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const senderToMarkAsRead = isAdmin ? 'user' : 'admin';

    await db.query(
      `UPDATE chat_messages 
       SET is_read = TRUE 
       WHERE user_id = ? AND sender = ? AND is_read = FALSE`,
      [userId, senderToMarkAsRead]
    );

    return res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("❌ 읽음 처리 실패:", err);
    return res.status(500).json({ error: "Read update failed" });
  }
});

//이메일 찾기로직


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(404).json({ error: "등록되지 않은 이메일입니다." });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 숫자
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10분 유효

    await db.query(
      `UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?`,
      [code, expires, email]
    );

    await sendResetCode(email, code); // 🔽 이메일 전송

    res.json({ message: "인증번호가 이메일로 전송되었습니다." });
  } catch (err) {
    console.error("메일 전송 실패:", err);
    res.status(500).json({ error: "메일 전송에 실패했습니다." });
  }
});

const authenticateWebSocket = async (ws, req) => {
  // 세션 미들웨어가 WebSocket req에 적용되지 않으므로, 실제로는 세션 스토어에서 직접 조회해야 함
  // 임시로 userId=1로 세팅
  req.user = { userId: 1, isAdmin: false, isGuest: false };
  return true;
};

module.exports = router;
