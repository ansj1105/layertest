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
    <div className="referra-tt">
      {/* 상단: 총 팀 수입 / 오늘의 수입 */}
      <div className="referra-section">
        <div className="referra-block">
          <h4 className="referra-title">{t('referral2.totalEarnings')}</h4>
          <p className="referra-value">{stats.totalEarnings} USDT</p>
        </div>
        <div className="referra-block">
          <h4 className="referra-title">{t('referral2.todayEarnings')}</h4>
          <p className="referra-value">{stats.todayEarnings} USDT</p>
        </div>
      </div>

      {/* 하단: 총 팀원 수 / 오늘 새로운 회원 */}
      <div className="referra-section">
        <div className="referra-block">
          <h4 className="referra-title">{t('referral2.totalMembers')}</h4>
          <p className="referra-value">
            {stats.totalMembers} {t('referral2.members')}
          </p>
        </div>
        <div className="referra-block">
          <h4 className="referra-title">{t('referral2.todayJoined')}</h4>
          <p className="referra-value">
            {stats.todayJoined} {t('referral2.members')}
          </p>
        </div>
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
