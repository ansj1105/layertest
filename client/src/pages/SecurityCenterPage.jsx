// 📁 src/pages/SecurityCenterPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function SecurityCenterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  // 이메일 마스킹 헬퍼 (cho@example.com → cho***com)
  const maskEmail = (raw) => {
    if (!raw.includes('@')) return raw;
    const [local, domain] = raw.split('@');
    const [name, ext] = domain.split('.');
    const first3 = local.slice(0, 3);
    const last3 = ext.slice(-3);
    return `${first3}***${last3}`;
  };

  useEffect(() => {
    axios.get('/api/mydata/me', { withCredentials: true })
      .then(res => {
        const user = res.data.user;
        if (user?.email) {
          setEmail(maskEmail(user.email));
        }
      })
      .catch(() => {
        setEmail('');
      });
  }, []);

  const goBack = () => navigate(-1);

  const items = [
    { label: t('security.email'),       value: email,         onClick: () => navigate('/security/email') },
    { label: t('security.tradePwd'),     value: '',            onClick: () => navigate('/security/trade-password') },
    { label: t('security.loginPwd'),     value: '',            onClick: () => navigate('/security/login-password') },
   {/* { label: t('security.withdrawAddr'), value: '',            onClick: () => navigate('/security/withdraw-address') },*/}
  ];

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100">
      {/* 상단바 */}
      <div className="flex items-center bg-[#2c1f0f] p-3">
        <button onClick={goBack} className="text-yellow-200 hover:text-yellow-100 mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">{t('security.title')}</h1>
      </div>

      {/* 리스트 */}
      <div className="mt-2 bg-[#3a270e] divide-y divide-yellow-700">
        {items.map((it, idx) => (
          <div
            key={idx}
            onClick={it.onClick}
            className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
              it.onClick ? 'hover:bg-yellow-900' : ''
            }`}
          >
            <span>{it.label}</span>
            <div className="flex items-center space-x-2">
              {it.value && <span className="text-sm text-yellow-300">{it.value}</span>}
              {it.onClick && <ChevronRight size={20} className="text-yellow-300" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
