// 📁 socket.js
const { Server } = require("socket.io");
const session = require("express-session");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 사용자 연결됨:", socket.id);

    // ✅ 사용자 채팅방 참여
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`✅ 유저 ${userId} 방 참여`);
    });

    // ✅ 관리자 참여
    socket.on("adminJoin", () => {
      socket.join("admin");
      console.log("🛠️ 관리자 방 참여");
    });

    // ✅ 사용자 메시지 수신
    socket.on("userMessage", ({ userId, message }) => {
      console.log(`📨 사용자 ${userId}:`, message);
      // 여기서 DB 저장 로직도 필요함
      io.to("admin").emit("newMessage", { userId, message });
    });

    // ✅ 관리자 응답
    socket.on("adminReply", ({ userId, message }) => {
      console.log(`📝 관리자 → ${userId}:`, message);
      // DB 저장 로직 필요함
      io.to(userId).emit("adminMessage", { message });
    });
  });

  return io;
}

module.exports = initSocket;
