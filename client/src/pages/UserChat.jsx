// 📁 src/pages/UserChat.jsx
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../styles/topbar.css';
import '../styles/UserChat.css';

// .env 기반 WebSocket 호스트
const WS_HOST = import.meta.env.VITE_WS_HOST || 'ws://localhost:4000';

// WebSocket 연결 설정
const connectWebSocket = (roomId, isGuest = false) => {
  //console.log('Attempting WebSocket connection to:', `${WS_HOST}/chat`);
  const ws = new WebSocket(`${WS_HOST}/chat`);

  ws.onopen = () => {
    //console.log('WebSocket connection opened successfully');
    ws.send(JSON.stringify({
      type: 'init',
      roomId,
      isGuest
    }));
  };

  ws.onerror = (error) => {
    console.error('WebSocket connection error:', error);
  };

  ws.onclose = (event) => {
    //console.log('WebSocket connection closed:', event.code, event.reason);
    // 연결이 끊어지면 3초 후 재연결 시도
    setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.CLOSED) {
        //console.log('Attempting to reconnect...');
        wsRef.current = connectWebSocket(roomId, isGuest);
      }
    }, 3000);
  };

  return ws;
};

export default function UserChat() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [defaultMsg, setDefaultMsg] = useState(null);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestInfo, setGuestInfo] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState(null);
  const [guestForm, setGuestForm] = useState({ name: '', email: '' });
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // 세션 체크 및 초기화
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionRes = await axios.get('/api/auth/me', { withCredentials: true });
        setUser(sessionRes.data.user);
        setIsGuest(false);
        setRoomId(sessionRes.data.user.roomId);
      } catch (error) {
        setUser(null);
        setIsGuest(true);
        // 쿠키에서 guestId 확인
        const guestId = getCookie('guestId');
        if (guestId) {
          const roomRes = await axios.get(`/api/chat/guest/rooms/${guestId}`, { withCredentials: true });
          if (roomRes.data.length > 0) {
            setRoomId(roomRes.data[0].id);
            setGuestInfo(roomRes.data[0]);
          }
        }
      }
    };
    checkSession();
  }, []);

  // WebSocket 연결 및 메시지 처리
  useEffect(() => {
    if (!roomId) return;
    setIsConnecting(true);
    wsRef.current = connectWebSocket(roomId, isGuest);
    wsRef.current.onopen = () => setIsConnecting(false);
    wsRef.current.onerror = () => setIsConnecting(false);
    wsRef.current.onclose = () => setIsConnecting(false);
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        const newMsg = {
          from: data.sender,
          text: data.message.message,
          time: new Date(data.message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: isOpen
        };
                setMessages(prev => {
                    const merged = [...prev, newMsg];
                    // ② time 오름차순 정렬
                    return merged.sort((a, b) => a.time - b.time);
                  });
        if (!isOpen) {
          setUnread(prev => prev + 1);
          setPopupVisible(true);
          setTimeout(() => setPopupVisible(false), 3000);
        } else {
          // 읽음 처리 API 호출
          if (isGuest) {
            axios.post('/api/chat/guest/chat-logs/read', { roomId, guestId: guestInfo?.id }, { withCredentials: true })
              .then(() => setUnread(0))
              .catch(console.error);
          } else {
            axios.post('/api/chat/user/chat-logs/read', { roomId }, { withCredentials: true })
              .then(() => setUnread(0))
              .catch(console.error);
          }
        }
      }
    };
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, [roomId, isGuest, isOpen, guestInfo]);

  // 기본 메시지 불러오기 (항상 최상단 안내)
  useEffect(() => {
    if (!roomId) return;
    const fetchDefaultMsg = async () => {
      try {
        const res = await axios.get('/api/chat/default-message');
        console.log('Fetched default message:', res.data);
        if (res.data && res.data.message) {
          setDefaultMsg({
            from: 'admin',
            text: res.data.message,
            time: '',
          });
        } else {
          setDefaultMsg(null);
        }
      } catch {
        setDefaultMsg(null);
      }
    };
    fetchDefaultMsg();
  }, [roomId]);

  // 메시지 로드
  useEffect(() => {
    if (!roomId) return;
    const fetchMessages = async () => {
      try {
        let res;
        if (isGuest) {
          // 게스트용
          res = await axios.get(`/api/chat/guest/chat-logs?roomId=${roomId}&guestId=${guestInfo?.id}`);
        } else {
          // 회원용
          res = await axios.get(`/api/chat/user/chat-logs?roomId=${roomId}`, { withCredentials: true });
        }
        let count = 0;
        // created_at 기준 오름차순 정렬
        const loaded = res.data
          .slice()
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map(msg => {
            const read = msg.is_read || msg.sender_type === 'user';
            if (!read && msg.sender_type === 'admin') count++;
            return {
              from: msg.sender_type,
              text: msg.message,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read
            };
          });
        console.log('[UserChat] 불러온 메시지 원본:', res.data); // 원본 로그
        console.log('[UserChat] 변환된 메시지:', loaded); // 변환 후 로그
        setMessages(loaded);
        setUnread(count);
      } catch (err) {
        setMessages([]);
        setUnread(0);
      }
    };
    fetchMessages();
  }, [roomId, isGuest, guestInfo]);

  // 비회원 채팅방 생성
  const createGuestRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/chat/guest/rooms', guestForm, { withCredentials: true });
      setRoomId(res.data.room.id);
      setGuestInfo(res.data.guest);
    } catch (error) {
      alert('방 생성 실패: ' + (error.response?.data?.error || error.message));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !roomId) return;
    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setIsConnecting(true);
        wsRef.current = connectWebSocket(roomId, isGuest);
        alert('메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const messageData = {
        type: 'chat',
        roomId,
        message: input,
        sender: isGuest ? 'guest' : 'user'
      };
      wsRef.current.send(JSON.stringify(messageData));
      setMessages(prev => [...prev, { from: isGuest ? 'guest' : 'user', text: input, time, read: true }]);
      setInput("");
    } catch (error) {
      alert('메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // 게스트 폼
  if (isGuest && !roomId) {
    return (
      <>
        <button
          id="fixed-bell"
          onClick={() => setIsOpen(true)}
        >
          <img src="/img/item/top/headphones.svg" alt={t('userChat.notificationAlt')} />
        </button>
        {isOpen && (
          <div className="chatbox-wrapper">
            <div className="chatbox-header">
              <h2 className="chatbox-title">{t("userChat.guestTitle")}</h2>
              <button onClick={() => setIsOpen(false)} className="chatbox-close-btn">✕</button>
            </div>
            <div className="chatbox-body">
              <form onSubmit={createGuestRoom}>
                <input
                  type="text"
                  name="name"
                  placeholder={t("userChat.guestName")}
                  required
                  className="chatbox-input"
                  value={guestForm.name}
                  onChange={e => setGuestForm(f => ({ ...f, name: e.target.value }))}
                />
                <input
                  type="email"
                  name="email"
                  placeholder={t("userChat.guestEmail")}
                  required
                  className="chatbox-input"
                  value={guestForm.email}
                  onChange={e => setGuestForm(f => ({ ...f, email: e.target.value }))}
                />
                <button type="submit" className="chatbox-send-btn">
                  {t("userChat.startChat")}
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // 채팅 UI
  if (!isOpen) {
    return (
      <>
        <button
          id="fixed-bell"
          onClick={async () => {
            if (!roomId) {
              setIsOpen(true);
              return;
            }
            // 읽음 처리 API 호출 및 로그
            if (isGuest) {
              console.log('[UserChat] 게스트 읽음 처리 API 호출', { roomId, guestId: guestInfo?.id });
              axios.post('/api/chat/guest/chat-logs/read', { roomId, guestId: guestInfo?.id }, { withCredentials: true })
                .then(res => console.log('[UserChat] 게스트 읽음 처리 결과:', res.data))
                .catch(console.error);
            } else {
              console.log('[UserChat] 유저 읽음 처리 API 호출', { roomId });
              axios.post('/api/chat/user/chat-logs/read', { roomId }, { withCredentials: true })
                .then(res => console.log('[UserChat] 유저 읽음 처리 결과:', res.data))
                .catch(console.error);
            }
            setIsOpen(true);
          }}
        >
          <img src="/img/item/top/headphones.svg" alt={t('userChat.notificationAlt')} />
          {unread > 0 && (
            <span className="unread-badge bg-red-500 text-white rounded-full">{unread}</span>
          )}
        </button>
        {popupVisible && (
          <div className="fixed bottom-[130px] right-4 bg-yellow-200 text-black px-4 py-2 rounded shadow-lg animate-bounce z-50">
            {t('userChat.newMessageNotification')}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="chatbox-wrapper">
      <div className="chatbox-header">
        <h2 className="chatbox-title">
          {isGuest ? t("userChat.guestChat") : t("userChat.title")}
        </h2>
        <button onClick={() => setIsOpen(false)} className="chatbox-close-btn">✕</button>
      </div>
      {isConnecting && (
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f0f0f0', color: '#666', fontSize: '14px' }}>
          {wsRef.current?.readyState === WebSocket.CONNECTING ? "연결중입니다..." : "연결이 끊어졌습니다. 재연결을 시도합니다..."}
        </div>
      )}
      <div className="chatbox-body">
        {/* 최상단에 어드민 기본 메시지 출력 */}
        {defaultMsg && (
          <div className="chatbox-msg chatbox-msg-admin" style={{ background: '#f5f5f5', color: '#1976d2', fontStyle: 'italic', marginBottom: 8 }}>
            <span className="chatbox-meta">[ {t('userChat.admin')} || {defaultMsg.time} ]</span> {defaultMsg.text}
          </div>
        )}
        {/* 나머지 메시지는 오름차순(기본적으로 오래된 순)으로 출력 */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chatbox-msg ${msg.from === (isGuest ? "guest" : "user") ? "chatbox-msg-user" : "chatbox-msg-admin"}`}
          >
            <span className="chatbox-meta">
              [ {msg.from === (isGuest ? "guest" : "user") ? t("userChat.me") : t("userChat.admin")} || {msg.time} {msg.from === "admin" && !msg.read ? t("userChat.unread") : ""}]
            </span>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbox-input-group">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="chatbox-input"
          placeholder={isConnecting ? "연결중..." : t("userChat.inputPlaceholder")}
          disabled={isConnecting}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="chatbox-send-btn" disabled={isConnecting}>
          {isConnecting ? "연결중..." : t("userChat.sendButton")}
        </button>
      </div>
    </div>
  );
}

// 쿠키 헬퍼 함수
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
