// 📁 src/components/CompanyIntroPage.jsx
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import '../styles/CompanyIntroPage.css';
import '../styles/topbar.css';

export default function CompanyIntroPage() {
  const { t } = useTranslation();
  // 배열 형태의 번역 문자열을 꺼낼 때는 returnObjects: true 옵션 사용
  const items = t('companyIntro.items', { returnObjects: true });

  return (
    <div className="company-intro-wrapper">
      <div className="company-intro-top-bar">
        {/* 뒤로 가기 */}
        <button
          onClick={() => window.history.back()}
          className="company-intro-back-btn"
        >
        <ArrowLeft size={24} />
        </button>
          
                {/* 타이틀 */}
          <div className="company-intro-title">
            {t('companyIntro.title')}
          </div>

      </div>
 


      <ul className="company-intro-list">
        {items.map((line, idx) => (
          <li key={idx} className="company-intro-list-item">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
