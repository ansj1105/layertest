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
  console.log('[UserChat] WebSocket 연결 시도:', `${WS_HOST}/chat`, { roomId, isGuest });

  // 쿠키를 포함한 WebSocket 연결
  const ws = new WebSocket(`${WS_HOST}/chat`);

  ws.onopen = () => {
    console.log('[UserChat] WebSocket 연결 성공');
    // 연결 후 초기화 메시지 전송
    ws.send(JSON.stringify({
      type: 'init',
      roomId,
      isGuest
    }));
  };

  ws.onerror = (error) => {
    console.error('[UserChat] WebSocket 연결 오류:', error);
  };

  ws.onclose = (event) => {
    console.log('[UserChat] WebSocket 연결 종료:', event.code, event.reason);
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
  const [wsConnected, setWsConnected] = useState(false); // WebSocket 연결 상태 추가
  const [user, setUser] = useState(null);
  const [guestForm, setGuestForm] = useState({ name: '', email: '' });
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const isOpenRef = useRef(isOpen); // isOpen 상태를 ref로 관리

  // isOpen 상태가 변경될 때 ref 업데이트
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

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

    console.log('[UserChat] WebSocket 연결 시작:', { roomId, isGuest });

    // 기존 연결이 있으면 정리
    if (wsRef.current) {
      wsRef.current.close();
    }

    setIsConnecting(true);
    setWsConnected(false);

    let connectionTimeout;
    let pollingInterval;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const startPolling = () => {
      console.log('[UserChat] 폴링 시작');
      if (pollingInterval) clearInterval(pollingInterval);

      pollingInterval = setInterval(async () => {
        try {
          let res;
          if (isGuest) {
            res = await axios.get(`/api/chat/guest/chat-logs?roomId=${roomId}&guestId=${guestInfo?.id}`);
          } else {
            res = await axios.get(`/api/chat/user/chat-logs?roomId=${roomId}`, { withCredentials: true });
          }

          const newMessages = res.data.filter(msg =>
            !msg.is_read && msg.sender_type === 'admin'
          );

          if (newMessages.length > 0) {
            console.log('[UserChat] 폴링으로 새 메시지 발견:', newMessages.length);
            setUnread(prev => {
              const newUnread = prev + newMessages.length;
              console.log('[UserChat] 폴링 unread 업데이트:', { prev, newUnread });
              return newUnread;
            });
            setPopupVisible(true);
            setTimeout(() => setPopupVisible(false), 3000);
          }
        } catch (error) {
          console.error('[UserChat] 폴링 오류:', error);
        }
      }, 2000); // 2초마다 폴링 (더 빠른 응답)
    };

    const connectWebSocketWithRetry = () => {
      try {
        console.log('[UserChat] WebSocket 연결 시도...');
        wsRef.current = connectWebSocket(roomId, isGuest);

        wsRef.current.onopen = () => {
          console.log('[UserChat] WebSocket 연결 성공');
          setIsConnecting(false);
          setWsConnected(true);
          reconnectAttempts = 0; // 성공 시 재시도 횟수 리셋
          clearTimeout(connectionTimeout);
        };

        wsRef.current.onerror = (error) => {
          console.error('[UserChat] WebSocket 연결 오류:', error);
          setIsConnecting(false);
          setWsConnected(false);

          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`[UserChat] WebSocket 재연결 시도 ${reconnectAttempts}/${maxReconnectAttempts}`);
            setTimeout(connectWebSocketWithRetry, 2000);
          } else {
            console.log('[UserChat] WebSocket 연결 실패, 폴링으로 전환');
            startPolling();
          }
        };

        wsRef.current.onclose = (event) => {
          console.log('[UserChat] WebSocket 연결 종료:', event.code, event.reason);
          setIsConnecting(false);
          setWsConnected(false);

          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`[UserChat] WebSocket 재연결 시도 ${reconnectAttempts}/${maxReconnectAttempts}`);
            setTimeout(connectWebSocketWithRetry, 2000);
          } else {
            console.log('[UserChat] WebSocket 연결 실패, 폴링으로 전환');
            startPolling();
          }
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[UserChat] WebSocket 메시지 수신:', data);

            if (data.type === 'chat') {
              console.log('[UserChat] 채팅 메시지 수신:', data);
              handleNewMessage(data);
            } else if (data.type === 'init') {
              console.log('[UserChat] WebSocket 초기화 완료:', data);
            } else if (data.type === 'error') {
              console.error('[UserChat] WebSocket 오류 메시지:', data);
            }
          } catch (error) {
            console.error('[UserChat] WebSocket 메시지 파싱 오류:', error);
          }
        };

        // 연결 타임아웃 설정 (3초)
        connectionTimeout = setTimeout(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            console.log('[UserChat] WebSocket 연결 타임아웃, 폴링 시작');
            startPolling();
          }
        }, 3000);

      } catch (error) {
        console.error('[UserChat] WebSocket 연결 실패:', error);
        setIsConnecting(false);
        setWsConnected(false);
        startPolling();
      }
    };

    connectWebSocketWithRetry();

    return () => {
      clearTimeout(connectionTimeout);
      clearInterval(pollingInterval);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [roomId, isGuest]);

  // 기본 메시지 불러오기 (항상 최상단 안내)
  useEffect(() => {
    if (!roomId) return;
    const fetchDefaultMsg = async () => {
      try {
        const res = await axios.get('/api/chat/default-message');
        //console.log('Fetched default message:', res.data);
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
        console.log('[UserChat] 메시지 로드 완료:', { count, messagesCount: loaded.length });
        setMessages(loaded);
        setUnread(count);
      } catch (err) {
        console.error('[UserChat] 메시지 로드 오류:', err);
        setMessages([]);
        setUnread(0);
      }
    };
    fetchMessages();
  }, [roomId, isGuest]); // guestInfo 의존성 제거

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

  // 새 메시지 처리 함수
  const handleNewMessage = (data) => {
    const newMsg = {
      from: data.sender,
      text: data.message.message,
      time: new Date(data.message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: isOpenRef.current
    };

    console.log('[UserChat] 새 메시지 처리:', { isOpen: isOpenRef.current, message: newMsg });

    setMessages(prev => {
      const merged = [...prev, newMsg];
      // 시간순 정렬
      return merged.sort((a, b) => new Date(a.time) - new Date(b.time));
    });

    if (!isOpenRef.current) {
      console.log('[UserChat] 새 메시지 수신 - 채팅창 닫힘, unread 증가');
      setUnread(prev => {
        const newUnread = prev + 1;
        console.log('[UserChat] unread 업데이트:', { prev, newUnread });
        return newUnread;
      });
      setPopupVisible(true);
      setTimeout(() => setPopupVisible(false), 3000);
    } else {
      console.log('[UserChat] 새 메시지 수신 - 채팅창 열림, 읽음 처리');
      // 채팅창이 열려있으면 즉시 읽음 처리
      markAsRead();
    }
  };

  // 읽음 처리 함수
  const markAsRead = async () => {
    try {
      if (isGuest) {
        await axios.post('/api/chat/guest/chat-logs/read', { roomId, guestId: guestInfo?.id }, { withCredentials: true });
        console.log('[UserChat] 게스트 읽음 처리 완료');
      } else {
        await axios.post('/api/chat/user/chat-logs/read', { roomId }, { withCredentials: true });
        console.log('[UserChat] 유저 읽음 처리 완료');
      }
      setUnread(0);
    } catch (error) {
      console.error('[UserChat] 읽음 처리 오류:', error);
    }
  };

  // 채팅창이 열릴 때 읽음 처리
  useEffect(() => {
    if (isOpen && roomId) {
      console.log('[UserChat] 채팅창 열림, 읽음 처리 시작');
      markAsRead();
    }
  }, [isOpen, roomId]);

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

            // 채팅창을 열기 전에 읽음 처리
            if (isGuest) {
              await axios.post('/api/chat/guest/chat-logs/read', { roomId, guestId: guestInfo?.id }, { withCredentials: true })
                .then(res => {
                  console.log('[UserChat] 게스트 읽음 처리 결과:', res.data);
                  setUnread(0); // 즉시 UI 업데이트
                })
                .catch(console.error);
            } else {
              await axios.post('/api/chat/user/chat-logs/read', { roomId }, { withCredentials: true })
                .then(res => {
                  console.log('[UserChat] 유저 읽음 처리 결과:', res.data);
                  setUnread(0); // 즉시 UI 업데이트
                })
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
      {!isConnecting && !wsConnected && (
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#fff3cd', color: '#856404', fontSize: '14px' }}>
          실시간 연결이 끊어졌습니다. 2초마다 새 메시지를 확인합니다.
        </div>
      )}
      {wsConnected && (
        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#d4edda', color: '#155724', fontSize: '14px' }}>
          실시간 연결됨
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
