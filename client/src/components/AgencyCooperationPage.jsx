// 📁 src/components/AgencyCooperationPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from 'lucide-react';

export default function AgencyCooperationPage() {
  const { t } = useTranslation();

  // 뒤로가기
  const handleBack = () => window.history.back();

  // JSON 에서 배열로 불러올 줄 단위 텍스트
  // en.json / ko.json 에 다음과 같이 설정하세요:
  //
  // "agencyCooperation": {
  //   "back": "뒤로",
  //   "title": "대행사 협력",
  //   "subTitle": "상담원 협력",
  //   "lines": [
  //     "Quantvine의 팀 프로그램에 가입하여 Quantvine을 홍보하고 커미션을 벌어보세요. Quantvine의 편리함과 지속가능성을 누구보다 누릴 수 있습니다.",
  //     "Quantvine은 각 사용자에게 넉넉한 팀 커미션 보상 메커니즘을 제공합니다.",
  //     "세 단계의 커미션 보상을 받을 수 있습니다: (이전은 Quantvine이 당신에게 주는 추가 보상이며, 팀 멤버에게 상가되지 않습니다)",
  //     "1. 친구 A가 공유하고, A가 당신의 1단계 멤버가 되면, 매일 하루에 하루 수익의 21%를 받게 됩니다.",
  //     "2. A가 친구 B와 공유하고, B가 당신의 2단계 멤버가 되면, 매일 B의 하루 수익의 7%를 받게 됩니다.",
  //     "3. B가 친구 C와 공유하고, C가 당신의 3단계 멤버가 되면, 매일 C의 하루 수익의 1%를 받게 됩니다.",
  //     "예시: ABC의 각 하위 멤버가 하루 수익이 $100이라고 가정할 때, 다음과 같이 받습니다:",
  //     "A급 하위 멤버 $100*21%의 대리점 커미션 $21.",
  //     "B급 하위 멤버 $100*7%의 대리점 커미션 $7.",
  //     "C급 하위 멤버 $100*1%의 대리점 커미션 $1.",
  //     "그날의 당신의 팀 커미션은 A21% + B7% + C1% = 29% 즉 $29입니다.",
  //     "모든 하위 멤버가 10A+100B+1000C=1110이라고 하면, 실질적으로 하루에 $100을 계속 얻었다고 가정합니다.",
  //     "A레벨 대리점 팀 커미션 수입 = 100 * 21% * 10명 = 210.",
  //     "B레벨 대리점 팀 커미션 수입 = 100 * 7% * 100명 = 700.",
  //     "C레벨 대리점 팀 커미션 수입 = 100 * 1% * 1000명 = 1000.",
  //     "당신의 하루 팀 수입은 A210 + B700 + C1000 = $1910입니다.",
  //     "이것은 매우 중요한 수입입니다."
  //   ]
  // }

  const title = t('agencyCooperation.title');
  const subTitle = t('agencyCooperation.subTitle');
  const lines = t('agencyCooperation.lines', { returnObjects: true });
  const backLabel = t('agencyCooperation.back');

  return (
    <div className="min-h-screen bg-[#1a1109] text-yellow-100 p-4">
      {/* 상단 바 */}
      <div className="flex items-center mb-4">
        <button
          onClick={handleBack}
          className="p-2 text-yellow-100 hover:text-white"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          {title}
        </h1>
        {/* 빈 아이템으로 가운데 정렬 유지 */}
        <div className="w-10" />
      </div>

      {/* 부제목 */}
      <h2 className="text-center text-sm mb-4">{subTitle}</h2>

      {/* 본문 내용 */}
      <div className="bg-[#3a270e] p-4 rounded-lg space-y-2 text-xs leading-relaxed">
        {lines.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>
    </div>
  );
}
