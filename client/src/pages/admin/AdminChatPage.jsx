import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:4000", {
  withCredentials: true,
});

export default function AdminChatPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    axios.get("http://localhost:4000/api/auth/users", { withCredentials: true })
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));

    socket.emit("adminJoin");

    socket.on("newMessage", ({ userId, message }) => {
      if (userId === selectedUser?.id) {
        setMessages((prev) => [...prev, { sender: "user", message }]);
      }
    });

    return () => socket.disconnect();
  }, [selectedUser]);

  const loadMessages = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/auth/messages/${userId}`, {
        withCredentials: true,
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    loadMessages(user.id);
  };

  const handleSend = async () => {
    if (!input) return;
    const newMessage = input;

    // 소켓 전송
    socket.emit("adminReply", { userId: selectedUser.id, message: newMessage });

    // DB 저장
    await axios.post("http://localhost:4000/api/auth/reply", {
      userId: selectedUser.id,
      message: newMessage,
    }, { withCredentials: true });

    setMessages((prev) => [...prev, { sender: "admin", message: newMessage }]);
    setInput("");
  };

  return (
    <div className="flex h-screen">
      {/* 좌측 유저 리스트 */}
      <div className="w-1/4 border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">📬 사용자 목록</h2>
        {users.map((u) => (
          <div
            key={u.id}
            className={`cursor-pointer p-2 rounded hover:bg-gray-100 ${selectedUser?.id === u.id ? 'bg-gray-200' : ''}`}
            onClick={() => handleSelectUser(u)}
          >
            {u.name} ({u.email})
          </div>
        ))}
      </div>

      {/* 우측 채팅창 */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded max-w-sm ${
                msg.sender === "admin" ? "bg-blue-200 ml-auto" : "bg-gray-100"
              }`}
            >
              {msg.message}
            </div>
          ))}
        </div>
        {selectedUser && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-4 py-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요"
            />
            <button
              onClick={handleSend}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              보내기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
