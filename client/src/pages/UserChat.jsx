// 📁 src/pages/UserChat.jsx
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../styles/topbar.css';
import '../styles/UserChat.css';

// .env 기반 WebSocket 호스트
const WS_HOST = import.meta.env.VITE_WS_HOST || 'ws://localhost:4000';

// WebSocket 연결 설정
const connectWebSocket = (userId, isGuest = false) => {
  console.log('Attempting WebSocket connection to:', `${WS_HOST}/chat`);
  const ws = new WebSocket(`${WS_HOST}/chat`);

  ws.onopen = () => {
    console.log('WebSocket connection opened successfully');
    ws.send(JSON.stringify({
      type: 'init',
      userId,
      isGuest
    }));
  };

  ws.onerror = (error) => {
    console.error('WebSocket connection error:', error);
  };

  ws.onclose = (event) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
  };

  return ws;
};

export default function UserChat() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestInfo, setGuestInfo] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // 세션 체크 및 초기화
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionRes = await axios.get('/api/auth/me', { withCredentials: true });
        setIsGuest(false);
        console.log('auth/me 응답:', sessionRes.data);
        setRoomId(sessionRes.data.user.roomId);
      } catch (error) {
        // 세션이 없으면 비회원으로 처리
        setIsGuest(true);
        // 쿠키에서 guestId 확인
        const guestId = getCookie('guestId');
        if (guestId) {
          // 기존 채팅방 조회
          const roomRes = await axios.get(`/api/chat/guest/rooms/${guestId}`);
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

    wsRef.current.onopen = () => {
      console.log('WebSocket 연결됨');
      setIsConnecting(false);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket 에러:', error);
      setIsConnecting(false);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket 연결 종료');
      setIsConnecting(false);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chat') {
        const newMsg = {
          from: data.sender,
          text: data.message.message,
          time: new Date(data.message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: isOpen
        };

        setMessages(prev => [...prev, newMsg]);

        if (!isOpen) {
          setUnread(prev => prev + 1);
          setPopupVisible(true);
          setTimeout(() => setPopupVisible(false), 3000);
        }
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId, isGuest, isOpen]);

  // 메시지 로드
  useEffect(() => {
    if (!roomId) return;

    const loadMessages = async () => {
      try {
        const res = await axios.get(`/api/chat/admin/chat-logs?roomId=${roomId}`);
        const loaded = res.data.map(msg => ({
          from: msg.sender_type,
          text: msg.message,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: msg.is_read
        }));
        setMessages(loaded);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [roomId]);

  // 비회원 채팅방 생성
  const createGuestRoom = async (name, email) => {
    try {
      const res = await axios.post('/api/chat/guest/rooms', { name, email });
      setRoomId(res.data.room.id);
      setGuestInfo(res.data.guest);
    } catch (error) {
      console.error('Failed to create guest room:', error);
    }
  };

  const sendMessage = async () => {
    console.log('sendMessage called:', { input, roomId, isConnecting });
    if (!input.trim() || !roomId) {
      console.log('Cannot send message: input empty or no roomId', { input, roomId });
      return;
    }

    try {
      // WebSocket 연결 상태 확인
      if (!wsRef.current) {
        console.error('WebSocket not initialized');
        return;
      }

      if (wsRef.current.readyState !== WebSocket.OPEN) {
        console.error('WebSocket not connected. Current state:', wsRef.current.readyState);
        setIsConnecting(true);
        // 재연결 시도
        wsRef.current = connectWebSocket(roomId, isGuest);
        return;
      }

      console.log('Sending message:', input);
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const messageData = {
        type: 'chat',
        roomId,
        message: input,
        sender: isGuest ? 'guest' : 'user'
      };

      wsRef.current.send(JSON.stringify(messageData));
      console.log('Message sent successfully');
      
      // 로컬 메시지 추가
      setMessages(prev => [...prev, { 
        from: isGuest ? 'guest' : 'user', 
        text: input, 
        time, 
        read: true 
      }]);

      setInput("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // 스크롤 처리
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 비회원 채팅방 생성 폼
  if (isGuest && !roomId) {
    return (
      <div className="chatbox-wrapper">
        <div className="chatbox-header">
          <h2 className="chatbox-title">{t("userChat.guestTitle")}</h2>
        </div>
        <div className="chatbox-body">
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            createGuestRoom(formData.get('name'), formData.get('email'));
          }}>
            <input
              type="text"
              name="name"
              placeholder={t("userChat.guestName")}
              required
              className="chatbox-input"
            />
            <input
              type="email"
              name="email"
              placeholder={t("userChat.guestEmail")}
              required
              className="chatbox-input"
            />
            <button type="submit" className="chatbox-send-btn">
              {t("userChat.startChat")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 채팅 UI
  if (!isOpen) {
    return (
      <>
        <button
          id="fixed-bell"
          onClick={() => setIsOpen(true)}
        >
          <img 
            src="/img/item/top/headphones.svg" 
            alt={t('userChat.notificationAlt')} 
          />
          {unread > 0 && (
            <span className="unread-badge">{unread}</span>
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
        <div style={{
          textAlign: 'center',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          color: '#666',
          fontSize: '14px'
        }}>
          {wsRef.current?.readyState === WebSocket.CONNECTING ? 
            "연결중입니다..." : 
            "연결이 끊어졌습니다. 재연결을 시도합니다..."}
        </div>
      )}

      <div className="chatbox-body">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chatbox-msg ${
              msg.from === (isGuest ? "guest" : "user") 
                ? "chatbox-msg-user" 
                : "chatbox-msg-admin"
            }`}
          >
            <span className="chatbox-meta">
              [ {msg.from === (isGuest ? "guest" : "user") 
                  ? t("userChat.me") 
                  : t("userChat.admin")} || {msg.time}{" "}
              {msg.from === "admin" && !msg.read ? t("userChat.unread") : ""}]
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
          onChange={(e) => {
            setInput(e.target.value);
            console.log('input changed:', e.target.value);
          }}
          className="chatbox-input"
          placeholder={isConnecting ? "연결중..." : t("userChat.inputPlaceholder")}
          disabled={isConnecting}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage} 
          className="chatbox-send-btn"
          disabled={isConnecting}
        >
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
