// 📁 src/pages/LoginPasswordPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import '../styles/LoginPasswordPage.css';
import '../styles/topbar.css';
axios.defaults.withCredentials = true;

export default function LoginPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    // 1) 유효성 검사
    if (newPwd.length < 6) {
      return alert(t('security_login.length_error'));
    }
    if (newPwd !== confirmPwd) {
      return alert(t('security_login.mismatch_new'));
    }
    // 확인 팝업
    if (!window.confirm(t('security_login.confirm_warning'))) return;

    try {
      await axios.post(
        '/api/security/password/change',
        { oldPassword: oldPwd, newPassword: newPwd },
        { withCredentials: true }
      );
      alert(t('security_login.success'));
      navigate(-1);
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg === 'INVALID_OLD_PASSWORD') {
        alert(t('security_login.mismatch_old'));
      } else {
        alert(t('security_login.fail'));
      }
    }
  };

  return (
  <div className="security-login-wrapper">
    {/* 상단 바 */}
    <div className="security-login-header">
      <button onClick={() => navigate(-1)} className="security-login-back-btn">
        <ArrowLeft size={24} className="text-yellow-200" />
      </button>
      <h1 className="security-login-title">{t('security_login.title')}</h1>
    </div>
  
    <div className="security-login-form-wrapper">
    {/* 기존 비밀번호 */}
    <label className="security-login-label">{t('security_login.old_password')}</label>
      <div className="security-login-input-group">
        <input
          type={showOld ? 'text' : 'password'}
          className="security-login-input"
          placeholder={t('security_login.enter_old')}
          value={oldPwd}
          onChange={e => setOldPwd(e.target.value)}
        />
        <button
          className="security-login-toggle-btn"
          onClick={() => setShowOld(v => !v)}
        >
          {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* 새 비밀번호 */}
      <label className="security-login-label">{t('security_login.new_password')}</label>
      <div className="security-login-input-group">
        <input
          type={showNew ? 'text' : 'password'}
          className="security-login-input"
          placeholder={t('security_login.enter_new')}
          value={newPwd}
          onChange={e => setNewPwd(e.target.value)}
        />
        <button
          className="security-login-toggle-btn"
          onClick={() => setShowNew(v => !v)}
        >
          {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* 비밀번호 확인 */}
      <label className="security-login-label">{t('security_login.confirm_password')}</label>
        <div className="security-login-input-group">
          <input
            type={showConfirm ? 'text' : 'password'}
            className="security-login-input"
            placeholder={t('security_login.enter_confirm')}
            value={confirmPwd}
            onChange={e => setConfirmPwd(e.target.value)}
          />
          <button
            type="button"
            className="security-login-toggle-btn"
            onClick={() => setShowConfirm(v => !v)}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

      {/* 제출 버튼 */}
      <button
        className="security-login-submit-btn"
        onClick={handleSubmit}
      >
        {t('security_login.submit')}
      </button>
    </div>
  </div>
  );
}
