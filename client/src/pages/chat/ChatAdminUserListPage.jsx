import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ChatAdminUserListPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // 토큰 필요시 Authorization 헤더 추가
        const token = localStorage.getItem('chatAdminToken');
        const res = await axios.get('/api/chat/admin/rooms', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRooms(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "채팅방 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>로딩 중...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: 40, color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: 32 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>유저 채팅 관리</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {rooms.map(room => (
          <li
            key={room.id}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }}
            onClick={() => navigate(`/chat/admin/room/${room.id}`)}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{room.sender_name || '이름없음'}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{room.sender_email || '이메일없음'}</div>
              <div style={{ fontSize: 12, color: '#aaa' }}>{room.sender_type === 'guest' ? '비회원' : '회원'}</div>
            </div>
            <span style={{ color: '#3b82f6', fontWeight: 500 }}>채팅방 입장</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 