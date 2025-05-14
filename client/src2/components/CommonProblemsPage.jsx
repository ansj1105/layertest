// 📁 src/pages/CommonProblemsPage.jsx
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-[#1a1109] text-yellow-100">
      {/* 상단 바 */}
      <div className="flex items-center bg-[#2c1f0f] p-3">
        <button onClick={back} className="text-yellow-200 hover:text-yellow-100 mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">{t('commonProblems.title')}</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* 문제 리스트 */}
        <ul className="list-decimal list-inside space-y-2">
          {lines.map((line, idx) => (
            <li key={idx} className="text-sm leading-relaxed">
              {line}
            </li>
          ))}
        </ul>

        {/* 수수료 안내 */}
        <div>
          <h2 className="font-semibold mb-1">• {t('commonProblems.feesTitle')}</h2>
          <ul className="list-disc list-inside space-y-1">
            {fees.map((fee, idx) => (
              <li key={idx} className="text-sm leading-relaxed">
                {fee}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
