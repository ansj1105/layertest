// 📁 src/pages/QuantTutorialPage.jsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export default function QuantTutorialPage() {
  const { t } = useTranslation();

  // 스크롤 최상단으로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const back = () => window.history.back();

  const vipCriteria = t('quantTutorial.vipUpgradeCriteria', { returnObjects: true });
  const vipDaily    = t('quantTutorial.vipDaily',              { returnObjects: true });

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100">
      {/* 상단 바 */}
      <div className="flex items-center bg-[#2c1f0f] p-3">
        <button onClick={back} className="text-yellow-200 hover:text-yellow-100 mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">{t('quantTutorial.title')}</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* 설명 */}
        <p className="leading-relaxed">
          {t('quantTutorial.description')}
        </p>

        {/* VIP 업그레이드 기준 */}
        <section>
          <h2 className="text-md font-semibold mb-2">• {t('quantTutorial.title')} VIP 업그레이드 기준</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {vipCriteria.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>

        {/* 개요 */}
        <section>
          <h2 className="text-md font-semibold mb-2">• 개요</h2>
          <p className="text-sm leading-relaxed">
            {t('quantTutorial.overview')}
          </p>
        </section>

        {/* 거래 방법 */}
        <section>
          <h2 className="text-md font-semibold mb-2">• {t('quantTutorial.method.title')}</h2>
          <p className="text-sm leading-relaxed">
            {t('quantTutorial.method.description')}
          </p>
        </section>

        {/* VIP 일일 수익 */}
        <section>
          <h2 className="text-md font-semibold mb-2">• VIP 일일 수익률 예시</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {vipDaily.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
