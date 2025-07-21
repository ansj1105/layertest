// 📁 src/pages/SecurityCenterPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import '../styles/SecurityCenterPage.css';
import '../styles/topbar.css';


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
    { label: t('security.email'), value: email, onClick: () => navigate('/security/email') },
    { label: t('security.tradePwd'), value: '', onClick: () => navigate('/security/trade-password') },
    { label: t('security.loginPwd'), value: '', onClick: () => navigate('/security/login-password') },

  ];

  return (
    <div className="security-page-wrapper">
      {/* 상단바 */}
      <div className="security-top-bar">
        <button onClick={goBack} className="security-back-button">
          <ArrowLeft size={24} />
        </button>
        <h1 className="security-title">{t('security.title')}</h1>
      </div>


      {/* 리스트 */}
      <div className="security-item-wrapper">
        {items.map((it, idx) => (
          <div
            key={idx}
            onClick={it.onClick}
            className={`security-item ${it.onClick ? 'security-item-hoverable' : ''}`}
          >
            <span>{it.label}</span>
            <div className="flex items-center">
              {it.value && <span className="security-item-value">{it.value}</span>}
              {it.onClick && <ChevronRight size={20} className="security-item-icon" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
