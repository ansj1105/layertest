// 📁 src/pages/EmailBindingPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

export default function EmailBindingPage() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [oldEmail, setOldEmail] = useState('');  // '' 로 초기화
  const [oldCode,  setOldCode ] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCode,  setNewCode ] = useState('');

  // 방어적 마스킹
  const mask = (raw = '') => {
    if (typeof raw !== 'string') raw = '';
    if (!raw.includes('@')) return raw;
    const [user, domain] = raw.split('@');
    return user.slice(0,3) + '***@' + domain;
  };

  useEffect(() => {
    axios.get('/api/mydata/me', { withCredentials: true })
      .then(res => {
        // 백엔드 /api/mydata/me 에 email 필드까지 함께 내려주도록 해두세요.
        setOldEmail(res.data.user.email || '');
      })
      .catch(() => {
        setOldEmail('');
      });
  }, []);

  const sendCode = async type => {
    // old → oldEmail, new → newEmail
    const email = type === 'old' ? oldEmail : newEmail;
    // 새 이메일 전송 시엔 형식 검사
    if (type === 'new') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return alert(t('security_p.invalid_email'));
      }
    }

    try {
      await axios.post(
        '/api/security/email/send-code',
        { email, type },
        { withCredentials: true }
      );
      alert(t('security_p.code_sent'));
    } catch (e) {
      alert('❌ ' + (e.response?.data?.error || t('security_p.code_failed')));
    }
  };

  const handleSubmit = () => {
     if (!oldCode.trim() || !newCode.trim()) {
         return alert(t('security_p.require_both_codes'));
        }
    if (!window.confirm(t('security_p.update_warning'))) {
      return;
    }
    axios.post(
      '/api/security/email/update',
      { oldCode, newEmail, newCode },
      { withCredentials: true }
    )
      .then(() => {
        alert(t('security_p.update_success'));
        nav(-1);
      })
      .catch(e => {
        alert('❌ ' + (e.response?.data?.error || t('security_p.update_failed')));
      });
  };

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* 상단 */}
      <div className="flex items-center mb-4">
        <button onClick={() => nav(-1)} className="mr-2">
          <ArrowLeft size={24} className="text-yellow-200"/>
        </button>
        <h1 className="text-lg font-semibold">{t('security_p.title')}</h1>
      </div>

      {/* 오래된 사서함 */}
      <label className="block mb-2 text-sm">{t('security_p.old_mailbox')}</label>
      <input
        type="text"
        readOnly
        className="w-full bg-[#2c1f0f] p-2 rounded mb-4"
        value={mask(oldEmail)}
      />

      {/* 오래된 코드 입력 */}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder={t('security_p.enter_code')}
          className="flex-1 bg-[#2c1f0f] p-2 rounded-l"
          value={oldCode}
          onChange={e => setOldCode(e.target.value)}
        />
        <button
          onClick={() => sendCode('old')}
          className="bg-yellow-600 px-4 rounded-r flex items-center"
        >
          <Send className="mr-1"/> {t('security_p.send_code')}
        </button>
      </div>

      {/* 새 우편함 */}
      <label className="block mb-2 text-sm">{t('security_p.new_mailbox')}</label>
      <input
        type="email"
        placeholder={t('security_p.enter_new_email')}
        className="w-full bg-[#2c1f0f] p-2 rounded mb-4"
        value={newEmail}
        onChange={e => setNewEmail(e.target.value)}
      />

      {/* 새 코드 입력 */}
      <div className="flex mb-6">
        <input
          type="text"
          placeholder={t('security_p.enter_code')}
          className="flex-1 bg-[#2c1f0f] p-2 rounded-l"
          value={newCode}
          onChange={e => setNewCode(e.target.value)}
        />
        <button
          onClick={() => sendCode('new')}
          className="bg-yellow-600 px-4 rounded-r flex items-center"
        >
          <Send className="mr-1"/> {t('security_p.send_code')}
        </button>
      </div>

      {/* 제출 */}
      <button
        onClick={handleSubmit}
        className="w-full bg-yellow-700 py-3 rounded text-black font-semibold"
      >
        {t('security_p.submit')}
      </button>
    </div>
  );
}
