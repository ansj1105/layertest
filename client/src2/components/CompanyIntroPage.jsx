// 📁 src/components/CompanyIntroPage.jsx
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export default function CompanyIntroPage() {
  const { t } = useTranslation();
  // 배열 형태의 번역 문자열을 꺼낼 때는 returnObjects: true 옵션 사용
  const items = t('companyIntro.items', { returnObjects: true });

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* 뒤로 가기 */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center mb-4 text-yellow-200 hover:text-yellow-100"
      >
        <ArrowLeft size={20} />
        <span className="ml-2">{t('companyIntro.back')}</span>
      </button>

      {/* 타이틀 */}
      <h2 className="text-center text-xl font-semibold mb-4">
        {t('companyIntro.title')}
      </h2>

      {/* 항목 리스트 */}
      <ul className="space-y-2">
        {items.map((line, idx) => (
          <li
            key={idx}
            className="bg-[#2b1e0f] p-4 rounded shadow hover:bg-[#3a270e] cursor-default"
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
