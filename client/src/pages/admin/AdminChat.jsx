// 📁 src/pages/admin/AdminChat.jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import AdminNav from '../../components/admin/AdminNav'; // ✅ 네비게이션 컴포넌트 추가

const socket = io('http://54.85.128.211:4000', { withCredentials: true });

export default function AdminChat({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    socket.emit('adminJoin');

    socket.on('newMessage', ({ userId, message }) => {
      if (userId === selectedUser?.id) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages((prev) => [...prev, { sender: 'user', message, created_at: time, user_name: selectedUser.name, is_read: false }]);
      }
      fetchUsers();
    });

    return () => {
      socket.off('newMessage');
    };
  }, [selectedUser]);

  const fetchUsers = () => {
    axios.get('/api/auth/users', { withCredentials: true })
      .then(res => setUsers(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const loadMessages = (user) => {
    setSelectedUser(user);
    axios.get(`/api/auth/messages/${user.id}`, { withCredentials: true })
      .then(res => setMessages(res.data))
      .catch(console.error);

    axios.patch(`/api/auth/messages/${user.id}/read`, {}, { withCredentials: true })
      .catch(console.error);
  };

  const handleReply = () => {
    if (!newMessage.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    socket.emit('adminReply', { userId: selectedUser.id, message: newMessage });
    setMessages((prev) => [...prev, {
      sender: 'admin',
      message: newMessage,
      created_at: time,
      user_name: '관리자',
      is_read: true
    }]);

    axios.post('/api/auth/reply', {
      userId: selectedUser.id,
      message: newMessage
    }, { withCredentials: true });

    setNewMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ 네비게이션 바 */}
      <AdminNav onLogout={onLogout} />

      {/* ✅ 채팅 섹션 */}
      <div className="flex ml-64 flex-1 overflow-hidden">
        {/* 사용자 목록 */}
        <div className="w-1/4 border-r overflow-y-auto bg-white">
          <h2 className="text-xl font-bold p-4">사용자 목록</h2>
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => loadMessages(user)}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedUser?.id === user.id ? 'bg-gray-200' : ''}`}
            >
              <div className="flex justify-between items-center">
                <span>{user.name} ({user.email})</span>
                {user.unread_count > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {user.unread_count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 채팅창 */}
        <div className="w-3/4 flex flex-col bg-gray-50">
          <div className="flex-grow p-4 overflow-y-auto">
            {selectedUser ? (
              <>
                <h2 className="text-xl font-bold mb-4">{selectedUser.name} 과의 대화</h2>
                <div className="space-y-3">
                  {messages.map((msg, idx) => {
                    const time = msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded max-w-[70%] ${isAdmin ? 'ml-auto bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          [{isAdmin ? '관리자' : msg.user_name || selectedUser.name} | {time}] {msg.is_read === false && !isAdmin ? '(안읽음)' : ''}
                        </div>
                        <div className="text-sm">{msg.message}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-gray-500">왼쪽 사용자 목록에서 선택하세요</p>
            )}
          </div>

          {/* 입력창 */}
          {selectedUser && (
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={handleReply} className="bg-blue-500 text-white px-4 rounded">
                  전송
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
