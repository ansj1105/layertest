// 📁 src/pages/QuantTutorialPage.jsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import '../styles/QuantTutorialPage.css';
import '../styles/topbar.css';

export default function QuantTutorialPage() {
  const { t } = useTranslation();

  // 스크롤 최상단으로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const back = () => window.history.back();

  const vipCriteria = t('quantTutorial.vipUpgradeCriteria', { returnObjects: true });
  const vipDaily = t('quantTutorial.vipDaily', { returnObjects: true });

  return (
    <div className="quant-tutorial-wrapper">
      {/* 상단 바 */}
      <div className="quant-tutorial-header">
        <button onClick={back} className="quant-tutorial-back-btn">
          <ArrowLeft size={24} />
        </button>
        <h1 className="quant-tutorial-title">{t('quantTutorial.title')}</h1>
      </div>

      <div className="quant-tutorial-content">
        {/* 설명 */}
        <p className="quant-tutorial-description">
          {t('quantTutorial.description')}
        </p>

        {/* VIP 업그레이드 기준 */}
        <section>
          <h2 className="quant-tutorial-section-title">
            • {t('quantTutorial.sections.vipCriteria')}
          </h2>
          <ul className="quant-tutorial-list">
            {vipCriteria.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>

        {/* 개요 */}
        <section>
          <h2 className="quant-tutorial-section-title">
            • {t('quantTutorial.sections.overview')}
          </h2>
          <p className="quant-tutorial-paragraph">
            {t('quantTutorial.overview')}
          </p>
        </section>

        {/* 거래 방법 */}
        <section>
          <h2 className="quant-tutorial-section-title">
            • {t('quantTutorial.method.title')}
          </h2>
          <p className="quant-tutorial-paragraph">
            {t('quantTutorial.method.description')}
          </p>
        </section>

        {/* VIP 일일 수익률 예시 */}
        <section>
          <h2 className="quant-tutorial-section-title">
            • {t('quantTutorial.sections.dailyReturns')}
          </h2>
          <ul className="quant-tutorial-list">
            {vipDaily.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
