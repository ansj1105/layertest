// 📁 src/pages/CommonProblemsPage.jsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import '../styles/CommonProblemsPage.css';
import '../styles/topbar.css';


export default function CommonProblemsPage() {
  const { t } = useTranslation();

  // 스크롤 최상단
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const back = () => window.history.back();
  const lines = t('commonProblems.lines', { returnObjects: true });
  const fees  = t('commonProblems.fees', { returnObjects: true });

  return (
    <div className="common-problems-wrapper">
      {/* 상단 바 */}
      <div className="common-problems-header">
        <button onClick={back} className="common-problems-back-btn">
          <ArrowLeft size={24} />
        </button>
        <h1 className="common-problems-title">{t('commonProblems.title')}</h1>
      </div>


      <div className="problems-content-wrapper">
        {/* 문제 리스트 */}
        <ul className="problems-list">
          {lines.map((line, idx) => (
            <li key={idx} className="problems-list-item">
              {line}
            </li>
          ))}
        </ul>

        {/* 수수료 안내 */}
        <div className="problems-fee-section">
          <h2 className="problems-fee-title">• {t('commonProblems.feesTitle')}</h2>
          <ul className="problems-fee-list">
            {fees.map((fee, idx) => (
              <li key={idx} className="problems-fee-item">
                {fee}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
