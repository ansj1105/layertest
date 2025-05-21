import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertPopup from '../../components/AlertPopup';
import axios from 'axios';

export default function ChatAdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ title: '', message: '', type: 'error' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/chat/admin/login', { email, password });
      if (res.data.token) {
        localStorage.setItem('chatAdminToken', res.data.token);
        setAlertInfo({ title: 'Success', message: '로그인 성공', type: 'success' });
        setShowAlert(true);
        setTimeout(() => navigate('/chat/admin/users'), 1000);
      } else {
        setAlertInfo({ title: 'Error', message: '로그인 실패', type: 'error' });
        setShowAlert(true);
      }
    } catch (err) {
      const msg = err.response?.data?.error || '서버 오류 또는 네트워크 오류';
      setAlertInfo({ title: 'Error', message: msg, type: 'error' });
      setShowAlert(true);
    }
  };

  return (
    <div className="chat-admin-login-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7fa' }}>
      <form className="chat-admin-login-box" onSubmit={handleLogin} style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #0001', minWidth: 320 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>채팅 관리자 로그인</h2>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 24, padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
          required
        />
        <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 6, background: '#3b82f6', color: '#fff', fontWeight: 600, border: 'none', fontSize: 16 }}>로그인</button>
      </form>
      {showAlert && (
        <AlertPopup
          isOpen={showAlert}
          onClose={() => setShowAlert(false)}
          title={alertInfo.title}
          message={alertInfo.message}
          type={alertInfo.type}
        />
      )}
    </div>
  );
} 