// 📁 src/pages/SystemNotices.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, ArrowLeft, Mail, MailOpen,ArrowLeftIcon } from 'lucide-react';
import '../styles/topbar.css';
import '../styles/SystemNotices.css';


export default function SystemNotices() {
  const [tab, setTab]         = useState('notices'); // 'notices' | 'inbox'
  const [notices, setNotices] = useState([]);
  const [inbox, setInbox]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail]   = useState(null);

  useEffect(() => {
    Promise.all([fetchNotices(), fetchInbox()])
      .finally(() => setLoading(false));
  }, []);

  const fetchNotices = async () => {
    try {
      const { data } = await axios.get('/api/messages/notices', { withCredentials: true });
      console.log('👀 fetchNotices →', data);
      setNotices(data);
    } catch (err) {
      console.error('❌ fetchNotices error', err);
    }
  };

  const fetchInbox = async () => {
    try {
      const { data } = await axios.get('/api/messages/inbox', { withCredentials: true });
      console.log('👀 fetchInbox →', data);
      setInbox(data);
    } catch (err) {
      console.error('❌ fetchInbox error', err);
    }
  };

  // 공고 읽음 처리
  const markNoticeRead = async item => {
    if (!item.is_read) {
      await axios.patch(`/api/messages/notices/${item.id}/read`, {}, { withCredentials: true });
      setNotices(notices.map(n => n.id === item.id ? { ...n, is_read: 1 } : n));
    }
  };

  // inbox 읽음 처리
  const markInboxRead = async item => {
    if (!item.is_read) {
      await axios.patch(`/api/messages/inbox/${item.id}/read`, {}, { withCredentials: true });
      setInbox(inbox.map(m => m.id === item.id ? { ...m, is_read: 1 } : m));
    }
  };

  const deleteItem = async (id, scope) => {
    if (scope === 'notices') {
      await axios.delete(`/api/messages/notices/${id}`, { withCredentials: true });
      setNotices(notices.filter(n => n.id !== id));
    } else {
      await axios.delete(`/api/messages/inbox/${id}`, { withCredentials: true });
      setInbox(inbox.filter(m => m.id !== id));
    }
  };

  const markAllRead = async () => {
    if (tab === 'notices') {
      await axios.patch(`/api/messages/notices/read-all`, {}, { withCredentials: true });
      setNotices(notices.map(n => ({ ...n, is_read: 1 })));
    } else {
      await axios.patch(`/api/messages/inbox/read-all`, {}, { withCredentials: true });
      setInbox(inbox.map(m => ({ ...m, is_read: 1 })));
    }
  };

  const deleteAll = async () => {
    if (tab === 'notices') {
      await axios.delete('/api/messages/notices', { withCredentials: true });
      setNotices([]);
    } else {
      await axios.delete('/api/messages/inbox', { withCredentials: true });
      setInbox([]);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-yellow-100">⏳ 로딩 중...</div>;
  }

  const list = tab === 'notices' ? notices : inbox;

  return (
    <div className="page-wrapper-mass">
      <div className="top-bar">

        <button onClick={() => window.history.back()} className="top-tran-sys">
          <ArrowLeftIcon size={24} />
        </button>
        <h2 className="top-h-text-sys">메시지 센터</h2>
      </div>  

      <div className="tab-bar">
        <button
          onClick={() => setTab('notices')}
          className={`tab-button ${tab === 'notices' ? 'active-button' : 'inactive-button'}`}
        >
          공고
        </button>
        <button
          onClick={() => setTab('inbox')}
          className={`tab-button ${tab === 'inbox' ? 'active-button' : 'inactive-button'}`}
        >
          시스템 알림
        </button>
      </div>

      {/* 리스트 */}
      <div className="message-list">
        {list.map(item => (
          <div
            key={item.id}
            className={`message-item ${!item.is_read ? 'unread' : 'read'}`}
            onClick={() => {
              if (tab === 'notices') markNoticeRead(item);
              else markInboxRead(item);
              setDetail(item);
            }}
          >
            <div className="message-content">
              {item.is_read
                ? <MailOpen className="message-icon" size={18} />
                : <Mail className="message-icon" size={18} />
              }
              <div>
                <p className="message-title">{item.title || item.content}</p>
                <span className="message-date">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <Trash2
              size={16}
              className="message-delete"
              onClick={e => {
                e.stopPropagation();
                deleteItem(item.id, tab);
              }}
            />
          </div>
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="bottom-action-bar">
        <button onClick={deleteAll} className="bottom-action-btn">
          모두 삭제
        </button>
        <button onClick={markAllRead} className="bottom-action-btn">
          모두 읽기
        </button>
      </div>

      {/* 상세 보기 오버레이 */}
      {detail && (
        <div className="detail-overlay">
          <div className="detail-header">
          <button
              onClick={() => setDetail(null)}
              className="detail-back-btn"
            >
              <ArrowLeft size={24} />
            </button>
            <span className="detail-title">세부</span>

          </div>
          <div className="detail-body">
            <h1>{detail.title}</h1>
            <span className="detail-date">
              {new Date(detail.created_at).toLocaleString()}
            </span>
            <p className="detail-content">
              {detail.body || detail.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
