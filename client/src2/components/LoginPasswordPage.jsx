// 📁 src/pages/LoginPasswordPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* 상단 바 */}
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft size={24} className="text-yellow-200" />
        </button>
        <h1 className="text-lg font-semibold">{t('security_login.title')}</h1>
      </div>

      {/* 이전 비밀번호 */}
      <label className="block mb-2 text-sm">{t('security_login.old_password')}</label>
      <div className="relative mb-4">
        <input
          type={showOld ? 'text' : 'password'}
          placeholder={t('security_login.enter_old')}
          className="w-full bg-[#2c1f0f] p-2 rounded"
          value={oldPwd}
          onChange={e => setOldPwd(e.target.value)}
        />
        <button
          onClick={() => setShowOld(v => !v)}
          className="absolute inset-y-0 right-2 top-2 text-yellow-300"
        >
          {showOld ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {/* 새 비밀번호 */}
      <label className="block mb-2 text-sm">{t('security_login.new_password')}</label>
      <div className="relative mb-4">
        <input
          type={showNew ? 'text' : 'password'}
          placeholder={t('security_login.enter_new')}
          className="w-full bg-[#2c1f0f] p-2 rounded"
          value={newPwd}
          onChange={e => setNewPwd(e.target.value)}
        />
        <button
          onClick={() => setShowNew(v => !v)}
          className="absolute inset-y-0 right-2 top-2 text-yellow-300"
        >
          {showNew ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {/* 비밀번호 확인 */}
      <label className="block mb-2 text-sm">{t('security_login.confirm_password')}</label>
      <div className="relative mb-6">
        <input
          type={showConfirm ? 'text' : 'password'}
          placeholder={t('security_login.enter_confirm')}
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
        {t('security_login.submit')}
      </button>
    </div>
  );
}
