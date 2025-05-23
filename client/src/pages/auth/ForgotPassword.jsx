import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../../styles/ForgotPassword.css';
import '../../styles/topbar.css';
import UserChat from '../UserChat';
 
export default function ForgotPassword() {
  const { t } = useTranslation();
  const nav = useNavigate();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleSendCode = async () => {
    try {
      await axios.post('/api/security/password/send-reset-code', { email });
      alert(t('forgotPassword.codeSent'));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || t('forgotPassword.errors.sendCode'));
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setError(t('forgotPassword.errors.codeRequired'));
      return;
    }
    try {
      await axios.post('/api/security/password/verify-code', {
        email,
        code
      });
      setIsVerified(true);
      setError('');
      alert(t('forgotPassword.verificationSuccess'));
    } catch (err) {
      setError(err.response?.data?.error || t('forgotPassword.errors.invalidCode'));
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!isVerified) {
        setError(t('forgotPassword.errors.verifyFirst'));
        return;
      }
      if (newPassword.length < 6) {
        setError(t('forgotPassword.errors.passwordLength'));
        return;
      }
      if (newPassword !== confirmPassword) {
        setError(t('forgotPassword.errors.passwordMismatch'));
        return;
      }

      await axios.post('/api/security/password/reset', {
        email,
        code,
        newPassword
      });

      alert(t('forgotPassword.resetSuccess'));
      nav('/login');
    } catch (err) {
      setError(err.response?.data?.error || t('forgotPassword.errors.resetFailed'));
    }
  };
 
  return (
    <div className="trade-pwd-wrapper">
      {/* 상단 바 */}
      <div className="trade-pwd-header">
        <button onClick={() => navigate(-1)}>

        </button>
        <button onClick={() => nav(-1)} className="trade-pwd-back-btn">
          <ArrowLeft size={24}/>
        </button>
        <div className="trade-pwd-title">{t('forgotPassword.title')}</div>
      </div>


      {/* 폼 */}
      <div className="trade-label-wrapper">
        <label className="trade-label">{t('forgotPassword.emailLabel')}</label>
        <input
          type="email"
          placeholder={t('forgotPassword.emailPlaceholder')}
          className="trade-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="sr-only">{t('forgotPassword.codeLabel')}</label>
        <div className="trade-code-group">
          <input
            type="text"
            placeholder={t('forgotPassword.codePlaceholder')}
            className="trade-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={handleSendCode} className="trade-send-btn">
            <Send className="mr-1" />
            {t('forgotPassword.sendCode')}
          </button>
        </div>

        <button 
          onClick={handleVerifyCode} 
          className="trade-submit-btn mb-4"
          style={{ marginTop: '0.5rem' }}
        >
          {t('forgotPassword.verifyCode')}
        </button>

        <label className="trade-label">{t('forgotPassword.newPasswordLabel')}</label>
        <div className="trade-password-group">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder={t('forgotPassword.newPasswordPlaceholder')}
            className="trade-password-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            onClick={() => setShowPassword(v => !v)}
            className="trade-toggle-btn"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <label className="trade-label">{t('forgotPassword.confirmPasswordLabel')}</label>
        <div className="trade-password-group">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('forgotPassword.confirmPasswordPlaceholder')}
            className="trade-password-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            onClick={() => setShowConfirmPassword(v => !v)}
            className="trade-toggle-btn"
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <button onClick={handleResetPassword} className="trade-submit-btn">
          {t('forgotPassword.resetButton')}
        </button>
        <UserChat />
      </div>
    </div>
  );
}
