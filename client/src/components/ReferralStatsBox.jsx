

// 📁 src/components/ReferralStatsBox.jsx
export default function ReferralStatsBox({ stats }) {
  if (!stats) {
    return (
      <div className="p-4 bg-[#2c1f0f] border border-yellow-700 rounded-lg mb-6 text-center text-yellow-300">
        📡 불러오는 중...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 bg-[#2c1f0f] border border-yellow-700 p-4 rounded-lg mb-6">
      {/* 총 팀 수익 */}
      <div className="flex flex-col">
        <h4 className="text-xs text-yellow-300 mb-1">총 팀 수익</h4>
        <p className="text-lg font-bold text-yellow-100">
          {stats.totalEarnings} USDT
        </p>
      </div>
      {/* 오늘 수입 */}
      <div className="flex flex-col">
        <h4 className="text-xs text-yellow-300 mb-1">오늘 수입</h4>
        <p className="text-lg font-bold text-yellow-100">
          {stats.todayEarnings} USDT
        </p>
      </div>
      {/* 총 팀원 수 */}
      <div className="flex flex-col">
        <h4 className="text-xs text-yellow-300 mb-1">총 팀원 수</h4>
        <p className="text-lg font-bold text-yellow-100">
          {stats.totalMembers} 명
        </p>
      </div>
      {/* 오늘 가입 팀원 */}
      <div className="flex flex-col">
        <h4 className="text-xs text-yellow-300 mb-1">오늘 가입 팀원</h4>
        <p className="text-lg font-bold text-yellow-100">
          {stats.todayJoined} 명
        </p>
      </div>
    </div>
  );
}

