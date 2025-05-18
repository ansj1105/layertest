// 📁 src/pages/UserChat.jsx
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../styles/topnav.css';

const socket = io("http://54.85.128.211:4000", {
  withCredentials: true
});

export default function UserChat({ userId }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ 읽음 처리 함수 분리
  const markMessagesAsRead = () => {
    axios
      .patch(`/api/auth/messages/${userId}/read`, {}, { withCredentials: true })
      .then(() => {
        setMessages(prev => prev.map(m => m.from === 'admin' ? { ...m, read: true } : m));
        setUnread(0);
      })
      .catch(console.error);
  };
  

  useEffect(() => {
    socket.emit("join", userId);

    axios.get(`/api/auth/messages/${userId}`, { withCredentials: true })
      .then(res => {
        let count = 0;
        const loaded = res.data.map(msg => {
          const read = msg.is_read || msg.sender === 'user';
          if (!read && msg.sender === 'admin') count++;
          return {
            from: msg.sender,
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read
          };
        });
        setMessages(loaded);
        setUnread(count);
      });

      socket.on("adminMessage", (msg) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
        const newMsg = {
          from: 'admin',
          text: msg.message,
          time,
          read: isOpen ? true : false
        };
      
        setMessages(prev => [...prev, newMsg]);
      
        if (!isOpen) {
          setUnread(prev => prev + 1);
          setPopupVisible(true);
          setTimeout(() => setPopupVisible(false), 3000);
        } else {
          axios.patch(`/api/auth/messages/${userId}/read`, {}, { withCredentials: true }).catch(console.error);
        }
      });
      

    return () => socket.off("adminMessage");
  }, [userId, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    socket.emit("userMessage", { userId, message: input });
    setMessages(prev => [...prev, { from: 'user', text: input, time, read: true }]);

    try {
      await axios.post("/api/auth/message", { message: input }, { withCredentials: true });
    } catch (err) {
      console.error(t('userChat.errors.messageSaveFailed'), err);
    }

    setInput("");
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  if (!isOpen) {
    return (
      <>
        <button
          id="fixed-bell"
          onClick={() => {
            setIsOpen(true);
            markMessagesAsRead();
          }}
        >
          <img 
            src="/img/item/top/headphones.svg" 
            alt={t('userChat.notificationAlt')} 
          />
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
    <div className="fixed bottom-12 right-4 w-96 bg-white p-4 rounded shadow-lg flex flex-col z-50" style={{ maxHeight: 600, height: '500px', width: '500px',overflowY: 'auto'  }}>
      <div className="flex justify-between items-center border-b pb-2 mb-2">
        <h2 className="text-lg font-semibold">{t('userChat.title')}</h2>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`text-sm p-2 rounded max-w-xs ${msg.from === 'user' ? 'bg-blue-100 self-end ml-auto' : 'bg-gray-100 self-start mr-auto'}`}>
            <div>
              <span className="block text-xs font-semibold text-gray-600 mb-1">
                [ {msg.from === 'user' ? t('userChat.me') : t('userChat.admin')} || {msg.time} {msg.from === 'admin' && !msg.read ? t('userChat.unread') : ''}]
              </span>
            </div>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border px-3 h-10 rounded flex-1"
          placeholder={t('userChat.inputPlaceholder')}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 h-10 rounded hover:bg-blue-600 whitespace-nowrap"
        >
          {t('userChat.sendButton')}
        </button>
      </div>
    </div>
  );
}
