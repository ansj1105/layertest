// 📁 src/pages/SystemNotices.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, ArrowLeft, Mail, MailOpen,ArrowLeftIcon } from 'lucide-react';

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
    <div className="min-h-screen bg-[#1a1109] text-yellow-100">
       <div className="p-4">
      <h2 className="text-center text-xl font-semibold mb-4">메시지 센터</h2>
      <button
        onClick={() => window.history.back()}
        className="flex items-center space-x-1 mb-4 text-yellow-200 hover:text-yellow-100"
      >
        <ArrowLeftIcon size={20} />
        <span>뒤로</span>
      </button>
      {/* 탭 */}
      <div className="flex mb-2 border-b border-yellow-400">
        <button
          className={`flex-1 py-2 ${tab==='notices'
            ? 'border-b-2 border-yellow-400 text-yellow-100'
            : 'text-yellow-300'}`}
          onClick={()=>setTab('notices')}
        >공고</button>
        <button
          className={`flex-1 py-2 ${tab==='inbox'
            ? 'border-b-2 border-yellow-400 text-yellow-100'
            : 'text-yellow-300'}`}
          onClick={()=>setTab('inbox')}
        >시스템 알림</button>
      </div>

      {/* 리스트 */}
      <div className="space-y-2 mb-16">
        {list.map(item => (
          <div
            key={item.id}
            className={`
              flex justify-between items-start p-3 rounded cursor-pointer
              ${(tab==='inbox' && !item.is_read) || (tab==='notices' && !item.is_read)
                ? 'bg-yellow-800'
                : 'bg-yellow-900'
              }
            `}
            onClick={() => {
              if (tab==='notices') markNoticeRead(item);
              else               markInboxRead(item);
              setDetail(item);
            }}
          >
            <div className="flex items-center">
              {item.is_read
                ? <MailOpen className="mr-2 text-yellow-300" size={18}/>
                : <Mail     className="mr-2 text-yellow-300" size={18}/>
              }
              <div>
                <p className="text-sm font-medium">{item.title || item.content}</p>
                <span className="text-xs text-yellow-300">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <Trash2
              size={16}
              className="ml-2 text-yellow-300 hover:text-red-500"
              onClick={e => {
                e.stopPropagation();
                deleteItem(item.id, tab);
              }}
            />
          </div>
        ))}
      </div>
      </div>
      {/* 하단 버튼 */}
      <div className="fixed bottom-25  left-0 right-0 flex">
        <button
          onClick={deleteAll}
          className="flex-1 bg-green-600 py-2 text-black"
        >모두 삭제</button>
        <button
          onClick={markAllRead}
          className="flex-1 bg-green-600 py-2 text-black"
        >모두 읽기</button>
      </div>

      {/* 상세 보기 오버레이 */}
      {detail && (
        <div className="fixed inset-0 bg-black/75 z-50">
          <div className="flex items-center bg-[#2c1f0f] p-3">
            <button
              onClick={()=>setDetail(null)}
              className="text-yellow-100 hover:text-white mr-2"
            >
              <ArrowLeft size={24}/>
            </button>
            <span className="text-yellow-100 text-lg font-semibold">세부</span>
          </div>
          <div className="p-4 bg-[#3a270e] text-yellow-100 h-full overflow-y-auto">
            <h1 className="text-xl font-semibold mb-2">{detail.title}</h1>
            <span className="text-xs text-yellow-300 mb-4 block">
              {new Date(detail.created_at).toLocaleString()}
            </span>
            <p className="whitespace-pre-wrap leading-relaxed">
              {detail.body || detail.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
