import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

axios.defaults.withCredentials = true;

export default function TradePasswordPage() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [email, setEmail]             = useState('');
  const [code, setCode]               = useState('');
  const [newPwd, setNewPwd]           = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    axios.get('/api/mydata/me', { withCredentials: true })
      .then(res => setEmail(res.data.user.email || ''))
      .catch(() => {});
  }, []);

  const sendCode = async () => {
    try {
      await axios.post(
        '/api/security/email/send-code',
        { email, type: 'trade' },
        { withCredentials: true }
      );
      alert(t('trade_pwd.code_sent'));
    } catch (e) {
      alert('❌ ' + (e.response?.data?.error || t('trade_pwd.code_failed')));
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm(t('trade_pwd.confirm_warning'))) return;
    try {
      await axios.post(
        '/api/security/trade-password',
        { code, newPassword: newPwd, confirmPassword: confirmPwd },
        { withCredentials: true }
      );
      alert(t('trade_pwd.success'));
      nav(-1);
    } catch (e) {
      alert('❌ ' + (e.response?.data?.error || t('trade_pwd.failed')));
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* 상단 바 */}
      <div className="flex items-center mb-4">
        <button onClick={() => nav(-1)} className="mr-2">
          <ArrowLeft size={24} className="text-yellow-200" />
        </button>
        <h1 className="text-lg font-semibold">{t('trade_pwd.title')}</h1>
      </div>

      {/* 이메일 */}
      <label className="block mb-2 text-sm">{t('trade_pwd.email_label')}</label>
      <input
        type="text"
        className="w-full bg-[#2c1f0f] p-2 rounded mb-4"
        readOnly
        value={email}
      />

      {/* 인증 코드 */}
      <label className="sr-only">{t('trade_pwd.code_label')}</label>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder={t('trade_pwd.code_placeholder')}
          className="flex-1 bg-[#2c1f0f] p-2 rounded-l"
          value={code}
          onChange={e => setCode(e.target.value)}
        />
        <button
          onClick={sendCode}
          className="bg-yellow-600 px-4 rounded-r flex items-center"
        >
          <Send className="mr-1" />
          {t('trade_pwd.send_code')}
        </button>
      </div>

      {/* 새 비밀번호 */}
      <label className="block mb-2 text-sm">{t('trade_pwd.new_pwd_label')}</label>
      <div className="relative mb-4">
        <input
          type={showPwd ? 'text' : 'password'}
          placeholder={t('trade_pwd.new_pwd_placeholder')}
          className="w-full bg-[#2c1f0f] p-2 rounded"
          value={newPwd}
          onChange={e => setNewPwd(e.target.value)}
        />
        <button
          onClick={() => setShowPwd(v => !v)}
          className="absolute inset-y-0 right-2 top-2 text-yellow-300"
        >
          {showPwd ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {/* 비밀번호 확인 */}
      <label className="block mb-2 text-sm">{t('trade_pwd.confirm_pwd_label')}</label>
      <div className="relative mb-6">
        <input
          type={showConfirm ? 'text' : 'password'}
          placeholder={t('trade_pwd.confirm_pwd_placeholder')}
          className="w-full bg-[#2c1f0f] p-2 rounded"
          value={confirmPwd}
          onChange={e => setConfirmPwd(e.target.value)}
        />
        <button
          onClick={() => setShowConfirm(v => !v)}
          className="absolute inset-y-0 right-2 top-2 text-yellow-300"
        >
          {showConfirm ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {/* 제출 */}
      <button
        onClick={handleSubmit}
        className="w-full bg-yellow-700 py-3 rounded text-black font-semibold"
      >
        {t('trade_pwd.submit')}
      </button>
    </div>
  );
}
