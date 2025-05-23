import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatAdminRoomPage from './ChatAdminRoomPage';

export default function ChatAdminUserListPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandUser, setExpandUser] = useState(true);
  const [expandGuest, setExpandGuest] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null); // for modal
  const [tab, setTab] = useState('rooms'); // 'rooms' | 'defaultMsg' | 'logs'
  const [defaultMsg, setDefaultMsg] = useState('');
  const [defaultMsgLoading, setDefaultMsgLoading] = useState(false);
  const [defaultMsgSaved, setDefaultMsgSaved] = useState(false);
  const [logFiles, setLogFiles] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [searchInput, setSearchInput] = useState({ name: '', email: '', type: '' });
  const [searchQuery, setSearchQuery] = useState({ name: '', email: '', type: '' });
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();

  // 토큰 체크 및 로그인 페이지 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem('chatAdminToken');
    if (!token) {
      navigate('/chat/admin/login');
    }
  }, [navigate]);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('chatAdminToken');
      if (token) {
        await axios.post('/api/chat/admin/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (window.chatAdminSocket && window.chatAdminSocket.readyState === 1) {
        window.chatAdminSocket.close();
      }
      localStorage.removeItem('chatAdminToken');
      navigate('/chat/admin/login');
    }
  };

  // 채팅방 목록
  useEffect(() => {
    if (tab !== 'rooms') return;
    setLoading(true);
    setError("");
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('chatAdminToken');
        if (!token) {
          navigate('/chat/admin/login');
          return;
        }
        const { name, email, type } = searchQuery;
        const res = await axios.get('/api/chat/admin/rooms/search', {
          headers: { Authorization: `Bearer ${token}` },
          params: { name, email, type }
        });
        setRooms(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/chat/admin/login');
        } else {
          setError(err.response?.data?.error || "채팅방 목록을 불러오지 못했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [tab, searchQuery, navigate]);

  // 로그파일 목록 조회
  useEffect(() => {
    if (tab !== 'logs') return;
    setLogLoading(true);
    const fetchLogFiles = async () => {
      try {
        const token = localStorage.getItem('chatAdminToken');
        if (!token) {
          navigate('/chat/admin/login');
          return;
        }
        const res = await axios.get('/api/chat/admin/logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const files = res.data.files || [];
        // 로그 파일 검색 필터링
        const filteredFiles = logSearchQuery
          ? files.filter(file => file.toLowerCase().includes(logSearchQuery.toLowerCase()))
          : files;
        setLogFiles(filteredFiles);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/chat/admin/login');
        } else {
          setError(err.response?.data?.error || "로그 파일 목록을 불러오는데 실패했습니다.");
        }
        setLogFiles([]);
      } finally {
        setLogLoading(false);
      }
    };
    fetchLogFiles();
  }, [tab, logSearchQuery, navigate]);

  // 기본메시지 조회
  useEffect(() => {
    if (tab !== 'defaultMsg') return;
    setDefaultMsgLoading(true);
    setDefaultMsgSaved(false);
    const fetchDefaultMsg = async () => {
      try {
        const token = localStorage.getItem('chatAdminToken');
        if (!token) {
          setError("로그인이 필요합니다.");
          return;
        }
        const res = await axios.get('/api/chat/admin/default-message', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDefaultMsg(res.data?.message || '');
      } catch (err) {
        console.error('기본 메시지 조회 실패:', err);
        if (err.response?.status === 401) {
          setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
        } else {
          setError(err.response?.data?.error || "기본 메시지를 불러오는데 실패했습니다.");
        }
        setDefaultMsg('');
      } finally {
        setDefaultMsgLoading(false);
      }
    };
    fetchDefaultMsg();
  }, [tab]);

  // 안읽은 메시지 개수 불러오기
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const token = localStorage.getItem('chatAdminToken');
        if (!token) return;
        const res = await axios.get('/api/chat/admin/rooms/unread-counts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // { room_id: unreadCount } 형태로 변환
        const map = {};
        res.data.forEach(row => { map[row.room_id] = row.unreadCount; });
        setUnreadCounts(map);
      } catch (err) {
        setUnreadCounts({});
      }
    };
    fetchUnreadCounts();
  }, [rooms]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>로딩 중...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: 40, color: 'red' }}>{error}</div>;

  // 회원/비회원 분리
  const userRooms = rooms.filter(room => room.sender_type === 'user');
  const guestRooms = rooms.filter(room => room.sender_type === 'guest');

  const tabButtonStyle = (isActive) => ({
    fontWeight: isActive ? 700 : 400,
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: isActive ? '2px solid #1976d2' : 'none',
    background: 'none',
    fontSize: 18,
    cursor: 'pointer',
    padding: '8px 16px'
  });

  return (
    <div style={{ maxWidth: 540, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: 32 }}>
      {/* 로그아웃 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          onClick={handleLogout}
          style={{
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          로그아웃
        </button>
      </div>

      {/* 탭 UI */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button onClick={() => setTab('rooms')} style={tabButtonStyle(tab === 'rooms')}>채팅방 목록</button>
        <button onClick={() => setTab('defaultMsg')} style={tabButtonStyle(tab === 'defaultMsg')}>기본메시지 설정</button>
        <button onClick={() => setTab('logs')} style={tabButtonStyle(tab === 'logs')}>로그파일 조회</button>
      </div>
      {/* 탭별 내용 */}
      {tab === 'rooms' && (
        <>
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>유저 채팅 관리</h2>
          
          {/* 검색 필터 */}
          <div style={{ marginBottom: 24, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
            <h4 style={{ marginBottom: 12 }}>검색 필터</h4>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="이름 검색"
                value={searchInput.name}
                onChange={e => setSearchInput(prev => ({ ...prev, name: e.target.value }))}
                style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
              />
              <input
                type="text"
                placeholder="이메일 검색"
                value={searchInput.email}
                onChange={e => setSearchInput(prev => ({ ...prev, email: e.target.value }))}
                style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
              />
              <select
                value={searchInput.type}
                onChange={e => setSearchInput(prev => ({ ...prev, type: e.target.value }))}
                style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
              >
                <option value="">전체</option>
                <option value="user">회원</option>
                <option value="guest">비회원</option>
              </select>
            </div>
            <button
              onClick={() => setSearchQuery(searchInput)}
              style={{ marginLeft: 8, padding: '8px 16px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600 }}
            >
              검색
            </button>
          </div>

          {/* 회원 채팅 */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{ cursor: 'pointer', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => setExpandUser(v => !v)}
            >
              <span>{expandUser ? '▼' : '▶'} 회원 채팅 ({userRooms.length})</span>
            </div>
            {expandUser && (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {userRooms.map(room => (
                  <li
                    key={room.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('chatAdminToken');
                        const res = await axios.get('/api/chat/admin/room-by-user-or-guest', {
                          headers: { Authorization: `Bearer ${token}` },
                          params: { userId: room.user_id }
                        });
                        // 읽음 처리 API 호출
                        await axios.post('/api/chat/admin/chat-logs/read', { roomId: res.data.id }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        setSelectedRoom(res.data);
                      } catch (err) {
                        alert('채팅방 정보를 불러오지 못했습니다.');
                      }
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{room.sender_name || '이름없음'}</div>
                      <div style={{ fontSize: 13, color: '#888' }}>{room.sender_email || '이메일없음'}</div>
                      <div style={{ fontSize: 12, color: '#aaa' }}>회원</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#3b82f6', fontWeight: 500 }}>채팅방 입장</span>
                      {unreadCounts[room.id] > 0 && (
                        <span style={{ background: '#dc3545', color: '#fff', borderRadius: 8, padding: '2px 8px', fontSize: 12, marginLeft: 8 }}>
                          {unreadCounts[room.id]}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* 비회원 채팅 */}
          <div>
            <div
              style={{ cursor: 'pointer', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => setExpandGuest(v => !v)}
            >
              <span>{expandGuest ? '▼' : '▶'} 비회원 채팅 ({guestRooms.length})</span>
            </div>
            {expandGuest && (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {guestRooms.map(room => (
                  <li
                    key={room.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('chatAdminToken');
                        const res = await axios.get('/api/chat/admin/room-by-user-or-guest', {
                          headers: { Authorization: `Bearer ${token}` },
                          params: { guestId: room.guest_id }
                        });
                        // 읽음 처리 API 호출
                        await axios.post('/api/chat/admin/chat-logs/read', { roomId: res.data.id }, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        setSelectedRoom(res.data);
                      } catch (err) {
                        alert('채팅방 정보를 불러오지 못했습니다.');
                      }
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{room.sender_name || '이름없음'}</div>
                      <div style={{ fontSize: 13, color: '#888' }}>{room.sender_email || '이메일없음'}</div>
                      <div style={{ fontSize: 12, color: '#aaa' }}>비회원</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#3b82f6', fontWeight: 500 }}>채팅방 입장</span>
                      {unreadCounts[room.id] > 0 && (
                        <span style={{ background: '#dc3545', color: '#fff', borderRadius: 8, padding: '2px 8px', fontSize: 12, marginLeft: 8 }}>
                          {unreadCounts[room.id]}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Modal: RoomPage */}
          {selectedRoom && (
            <ChatAdminRoomPage room={selectedRoom} onClose={() => setSelectedRoom(null)} />
          )}
        </>
      )}
      {tab === 'defaultMsg' && (
        <div>
          <h3 style={{ marginBottom: 16 }}>기본 안내 메시지 설정</h3>
          {defaultMsgLoading ? <div>불러오는 중...</div> : (
            <>
              {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
              <textarea
                value={defaultMsg}
                onChange={e => { setDefaultMsg(e.target.value); setDefaultMsgSaved(false); }}
                rows={4}
                style={{ width: '100%', marginBottom: 12 }}
              />
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('chatAdminToken');
                    if (!token) {
                      setError("로그인이 필요합니다.");
                      return;
                    }
                    await axios.put(
                      '/api/chat/admin/default-message',
                      { message: defaultMsg },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setDefaultMsgSaved(true);
                    setError(""); // 성공 시 에러 메시지 초기화
                  } catch (err) {
                    console.error('기본 메시지 저장 실패:', err);
                    if (err.response?.status === 401) {
                      setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
                    } else {
                      setError(err.response?.data?.error || "기본 메시지 저장에 실패했습니다.");
                    }
                  }
                }}
                style={{ 
                  background: '#1976d2', 
                  color: '#fff', 
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
                  borderRadius: 6, 
                  padding: '8px 20px', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >저장</button>
              {defaultMsgSaved && <span style={{ color: 'green', marginLeft: 12 }}>저장됨!</span>}
            </>
          )}
        </div>
      )}
      {tab === 'logs' && (
        <div>
          <h3 style={{ marginBottom: 16 }}>채팅 로그파일 목록</h3>
          
          {/* 로그 파일 검색 */}
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="로그 파일명 검색"
              value={logSearchQuery}
              onChange={e => setLogSearchQuery(e.target.value)}
              style={{ 
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ddd',
                marginBottom: 12
              }}
            />
          </div>

          {logLoading ? <div>불러오는 중...</div> : (
            <>
              {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {logFiles.length === 0 && <li>로그파일이 없습니다.</li>}
                {logFiles.map(file => (
                  <li key={file} style={{ marginBottom: 8 }}>
                    <a
                      href={`/api/chat/admin/logs/${file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#1976d2', textDecoration: 'underline' }}
                      onClick={e => {
                        e.preventDefault();
                        const token = localStorage.getItem('chatAdminToken');
                        if (!token) {
                          navigate('/chat/admin/login');
                          return;
                        }
                        window.open(`/api/chat/admin/logs/${file}?token=${token}`, '_blank');
                      }}
                    >
                      {file}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}