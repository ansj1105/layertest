import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [result, setResult] = useState('');

  const handleReset = async () => {
    try {
      const res = await axios.post("/api/auth/reset-password", { token, newPassword });
      setResult(res.data.message);
    } catch (err) {
      setResult(err.response?.data?.error || t('resetPassword.errors.resetFailed'));
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">{t('resetPassword.title')}</h2>
      <input
        type="text"
        placeholder={t('resetPassword.tokenPlaceholder')}
        className="border px-3 py-2 w-full"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <input
        type="password"
        placeholder={t('resetPassword.newPasswordPlaceholder')}
        className="border px-3 py-2 w-full"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleReset} className="bg-green-600 text-white px-4 py-2 rounded">
        {t('resetPassword.resetButton')}
      </button>
      {result && <p>{result}</p>}
    </div>
  );
}
