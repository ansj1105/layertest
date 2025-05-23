import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function ChatAdminRoomPage({ room, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // roomId 보정 (id 또는 room_id)
  const roomId = room.id || room.room_id;

  // 채팅 내역 불러오기
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('chatAdminToken');
        const res = await axios.get(`/api/chat/admin/chat-logs?roomId=${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data); // 오래된 순서대로 출력
      } catch (err) {
        setError('채팅 내역을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [roomId]);

  // 스크롤 항상 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송
  const sendMessage = async () => {
    if (!input.trim()) return;
    setSending(true);
    setError('');
    try {
      const token = localStorage.getItem('chatAdminToken');
      await axios.post('/api/chat/admin/send', {
        roomId: roomId,
        message: input
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInput('');
      // 전송 후 새로고침
      const res = await axios.get(`/api/chat/admin/chat-logs?roomId=${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data); // 오래된 순서대로 출력
    } catch (err) {
      setError('메시지 전송 실패');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.35)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', minWidth: 320, maxWidth: 480, width: '90vw', maxHeight: '90vh', overflow: 'auto', position: 'relative', padding: 24
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: '#888' }}>×</button>
        <h3 style={{ marginBottom: 12 }}>채팅방 상세 (ID: {roomId})</h3>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>이름: {room.sender_name || '이름없음'} / 이메일: {room.sender_email || '이메일없음'} / 타입: {room.sender_type}</div>
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, height: 320, overflowY: 'auto', background: '#fafbfc', marginBottom: 12 }}>
          {loading ? <div>불러오는 중...</div> : (
            messages.length === 0 ? <div style={{ color: '#aaa' }}>메시지가 없습니다.</div> :
              messages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: 10, textAlign: msg.sender_type === 'admin' ? 'right' : 'left' }}>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    [{msg.sender_type === 'admin' ? '관리자' : msg.sender_name || msg.sender_type}] {new Date(msg.created_at).toLocaleString()}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    background: msg.sender_type === 'admin' ? '#1976d2' : '#eee',
                    color: msg.sender_type === 'admin' ? '#fff' : '#222',
                    borderRadius: 8,
                    padding: '6px 12px',
                    maxWidth: 260,
                    wordBreak: 'break-all',
                  }}>{msg.message}</div>
                </div>
              ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            placeholder="메시지 입력..."
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}
          >전송</button>
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}
