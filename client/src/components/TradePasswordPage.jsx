import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/TradePasswordPage.css';
import '../styles/topbar.css';


axios.defaults.withCredentials = true;

export default function TradePasswordPage() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    axios.get('/api/mydata/me', { withCredentials: true })
      .then(res => setEmail(res.data.user.email || ''))
      .catch(() => { });
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
    <div className="trade-pwd-wrapper1">
      {/* 상단 바 */}
      <div className="trade-pwd-header1">
        <button onClick={() => nav(-1)} className="trade-pwd-back-btn">
          <ArrowLeft size={24} />
        </button>
        <div className="trade-pwd-title">{t('trade_pwd.title')}</div>
      </div>


      {/* 이메일 */}
      <div className="trade-label-wrapper1">
        <label className="trade-label">{t('trade_pwd.email_label')}</label>
        <input
          type="text"
          placeholder={t('security_p.enter_new_email')}
          className="trade-input"
          readOnly
          value={email}
        />

        <label className="sr-only">{t('trade_pwd.code_label')}</label>
        <div className="trade-code-group">
          <input
            type="text"
            placeholder={t('trade_pwd.code_placeholder')}
            className="trade-code-input"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <button onClick={sendCode} className="trade-send-btn">
            <Send className="mr-1" />
            {t('trade_pwd.send_code')}
          </button>
        </div>

        <label className="trade-label">{t('trade_pwd.new_pwd_label')}</label>
        <div className="trade-password-group">
          <input
            type={showPwd ? 'text' : 'password'}
            placeholder={t('trade_pwd.new_pwd_placeholder')}
            className="trade-password-input"
            value={newPwd}
            onChange={e => setNewPwd(e.target.value)}
          />
          <button
            onClick={() => setShowPwd(v => !v)}
            className="trade-toggle-btn"
          >
            {showPwd ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <label className="trade-label">{t('trade_pwd.confirm_pwd_label')}</label>
        <div className="trade-password-group">
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder={t('trade_pwd.confirm_pwd_placeholder')}
            className="trade-password-input"
            value={confirmPwd}
            onChange={e => setConfirmPwd(e.target.value)}
          />
          <button
            onClick={() => setShowConfirm(v => !v)}
            className="trade-toggle-btn"
          >
            {showConfirm ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <button onClick={handleSubmit} className="trade-submit-btn">
          {t('trade_pwd.submit')}
        </button>
      </div>
    </div>
  );
}
