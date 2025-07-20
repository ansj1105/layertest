// 📁 src/pages/RechargeMethodPage.jsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/RechargeMethodPage.css';
import '../styles/topbar.css';

export default function RechargeMethodPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
 
  return (
    <div className="charge-wrapper">
      {/* 헤더 */}
      <div className="charge-header">
        <button
          onClick={() => navigate(-1)}
          className="charge-back-button"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h1 className="charge-title">{t('rechargeMethod.title')}</h1>
        {/* 출금 내역 버튼 (SVG 아이콘 포함) */}
        <button
          onClick={() => navigate("/withdraw/history")}
          className="charge-header-right"
          title={t('rechargeMethod.historyButtonTitle')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            {/* 문서 테두리 */}
            <rect x="4" y="3" width="16" height="18" rx="2" ry="2" />

            {/* 내역 라인들 */}
            <line x1="8" y1="8" x2="16" y2="8" strokeLinecap="round" />
            <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round" />
            <line x1="8" y1="16" x2="12" y2="16" strokeLinecap="round" />

            {/* 출금 화살표 */}
            <path d="M12 18v3m0 0l-2-2m2 2l2-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 본문 */}
      <div
        className="charge-method-selector"
        onClick={() => navigate('/recharge/usdt')}
      >
        <div className="currency-label">
          <img src="/img/usdt.png" alt={t('rechargeMethod.usdtLogoAlt')} className="charge-method-icon" />
          <span className="charge-method-label">USDT</span>
        </div>
        <span className="charge-method-chevron">{'>'}</span>
      </div>
      <div className="charge-method-selector" onClick={() => navigate('/recharge/bnb')}> 
        <div className="currency-label">
          <img src="/img/bnb.png" alt={t('rechargeMethod.bnbLogoAlt')} className="charge-method-icon" />
          <span className="charge-method-label">BNB</span>
        </div>
        <span className="charge-method-chevron">{'>'}</span>
      </div>
    </div>
  );
}
