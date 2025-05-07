import { useTranslation } from 'react-i18next';

export default function referral2StatsBox({ stats }) {
  const { t } = useTranslation();

  if (!stats) {
    return (
      <div className="p-4 bg-[#2c1f0f] border border-yellow-700 rounded-lg mb-6 text-center text-yellow-300">
        {t('referral2.loading')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 bg-[#2c1f0f] border border-yellow-700 p-4 rounded-lg mb-6">
      {/* Total Team Earnings */}
      <div className="flex flex-col">
        <h4 className="text-xs text-yellow-300 mb-1">{t('referral2.totalEarnings')}</h4>
        <p className="text-lg font-bold text-yellow-100">
          {stats.totalEarnings} USDT
        </p>
      </div>
      {/* Today's Earnings */}
      <div className="flex flex-col">
        <h4 className="text-xs text-yellow-300 mb-1">{t('referral2.todayEarnings')}</h4>
        <p className="text-lg font-bold text-yellow-100">
          {stats.todayEarnings} USDT
        </p>
      </div>
      {/* Total Team Members */}
      <div className="flex flex-col">
        <h4 className="text-xs text-yellow-300 mb-1">{t('referral2.totalMembers')}</h4>
        <p className="text-lg font-bold text-yellow-100">
          {stats.totalMembers} {t('referral2.members')}
        </p>
      </div>
      {/* New Members Today */}
      <div className="flex flex-col">
        <h4 className="text-xs text-yellow-300 mb-1">{t('referral2.todayJoined')}</h4>
        <p className="text-lg font-bold text-yellow-100">
          {stats.todayJoined} {t('referral2.members')}
        </p>
      </div>
    </div>
  );
}

/* 추가: src/locales/ko/referral2.json */
/*
{
  "referral2": {
    "loading": "📡 불러오는 중...",
    "totalEarnings": "총 팀 수익",
    "todayEarnings": "오늘 수입",
    "totalMembers": "총 팀원 수",
    "todayJoined": "오늘 가입 팀원",
    "members": "명"
  }
}
*/

/* 추가: src/locales/en/referral2.json */
/*
{
  "referral2": {
    "loading": "📡 Loading...",
    "totalEarnings": "Total Team Earnings",
    "todayEarnings": "Today's Earnings",
    "totalMembers": "Total Team Members",
    "todayJoined": "New Members Today",
    "members": "members"
  }
}
*/
