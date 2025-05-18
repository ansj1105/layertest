import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../../styles/TradePasswordPage.css';
import '../../styles/topbar.css';

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
      alert('인증코드가 발송되었습니다.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || '인증코드 발송 실패');
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setError('인증코드를 입력해주세요.');
      return;
    }
    try {
      // 여기서는 실제 인증 확인만 하고 비밀번호는 변경하지 않습니다
      await axios.post('/api/security/password/verify-code', {
        email,
        code
      });
      setIsVerified(true);
      setError('');
      alert('인증이 완료되었습니다.');
    } catch (err) {
      setError(err.response?.data?.error || '인증코드가 유효하지 않습니다.');
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!isVerified) {
        setError('먼저 인증코드 확인을 완료해주세요.');
        return;
      }
      if (newPassword.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }

      await axios.post('/api/security/password/reset', {
        email,
        code,
        newPassword
      });

      alert('비밀번호가 성공적으로 변경되었습니다.');
      nav('/login');
    } catch (err) {
      setError(err.response?.data?.error || '비밀번호 재설정 실패');
    }
  };

  return (
    <div className="trade-pwd-wrapper">
      {/* 상단 바 */}
      <div className="trade-pwd-header">
        <button onClick={() => nav(-1)} className="trade-pwd-back-btn">
          <ArrowLeft size={24}/>
        </button>
        <div className="trade-pwd-title">비밀번호 변경</div>
      </div>

      {/* 폼 */}
      <div className="trade-label-wrapper">
        <label className="trade-label">이메일 주소</label>
        <input
          type="email"
          placeholder="가입한 이메일을 입력하세요"
          className="trade-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="sr-only">인증코드</label>
        <div className="trade-code-group">
          <input
            type="text"
            placeholder="인증코드 6자리"
            className="trade-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={handleSendCode} className="trade-send-btn">
            <Send className="mr-1" />
            코드 전송
          </button>
        </div>

        <button 
          onClick={handleVerifyCode} 
          className="trade-submit-btn mb-4"
          style={{ marginTop: '0.5rem' }}
        >
          인증코드 확인
        </button>

        <label className="trade-label">새 비밀번호</label>
        <div className="trade-password-group">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="새 비밀번호를 입력하세요"
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

        <label className="trade-label">비밀번호 확인</label>
        <div className="trade-password-group">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="비밀번호를 다시 입력하세요"
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
          비밀번호 재설정
        </button>
      </div>
    </div>
  );
}
